"""Synthetic training data for the plan recommender.

There is no real customer data yet, so we bootstrap the model from simulated
profiles labelled by business assumptions about who each plan is for. The
assumptions live in PREFERENCE_RULES below — review and tune them; they are
the main thing the model learns until real choices (recorded by the
/plan-finder page) are mixed in by train.py.

Each rule adds a score to a plan. A profile's label is sampled from the scores
with random noise, so the data reflects that real people don't always pick
the "obvious" plan.
"""

import numpy as np

from app.ml.features import PLANS, RESTRICTIONS, age_band, bmi

# (feature, value) -> {plan: score}. Positive = makes the plan more likely.
PREFERENCE_RULES = {
    ("occupation", "student"): {"essential": 2.0, "macro-fit": 0.3},
    ("occupation", "professional"): {"workweek": 1.8},
    ("occupation", "retired"): {"essential": 2.0, "workweek": 0.3},
    ("occupation", "other"): {"workweek": 0.5, "essential": 0.5},
    ("goal", "muscle"): {"macro-fit": 2.5},
    ("goal", "weight-loss"): {"workweek": 0.8, "macro-fit": 0.5},
    ("goal", "wellness"): {"workweek": 0.5, "essential": 0.6},
    ("activity", "sedentary"): {"macro-fit": -0.6},
    ("activity", "very-active"): {"macro-fit": 1.0},
    ("budget", "under-150"): {"essential": 2.2, "workweek": -1.0, "macro-fit": -1.5},
    ("budget", "150-300"): {"essential": 0.6, "workweek": 0.4, "macro-fit": -0.3},
    ("budget", "300-500"): {"workweek": 0.8, "macro-fit": 0.6},
    ("budget", "500-plus"): {"workweek": 0.6, "macro-fit": 1.0, "essential": -0.8},
    ("meals_per_day", 1): {"essential": 1.0},
    ("meals_per_day", 2): {"workweek": 0.8},
    ("meals_per_day", 3): {"macro-fit": 0.8},
    ("age_band", "13-22"): {"essential": 0.6},
    ("age_band", "60-plus"): {"essential": 1.0, "macro-fit": -1.0},
    ("diet", "vegan"): {"macro-fit": -0.3},
    ("restriction", "low-sodium"): {"essential": 0.5},
}
WORKOUT_SCORE_PER_SESSION = {"macro-fit": 0.35}  # relative to 2 sessions/week
OBESE_WEIGHT_LOSS_SCORE = {"workweek": 0.4}  # BMI >= 30 and goal weight-loss
BASE_SCORE = {"workweek": 0.3}
NOISE_SCALE = 1.0  # Gumbel noise; higher = less predictable choices


def preference_scores(profile: dict) -> np.ndarray:
    scores = np.zeros(len(PLANS))

    def add(contribution: dict):
        for plan, value in contribution.items():
            scores[PLANS.index(plan)] += value

    add(BASE_SCORE)
    keys = [
        ("occupation", profile["occupation"]),
        ("goal", profile["goal"]),
        ("activity", profile["activity"]),
        ("budget", profile["budget"]),
        ("meals_per_day", profile["meals_per_day"]),
        ("age_band", age_band(profile["age"])),
        ("diet", profile["diet"]),
    ] + [("restriction", r) for r in profile["restrictions"]]
    for key in keys:
        add(PREFERENCE_RULES.get(key, {}))

    add({p: v * (profile["workouts_per_week"] - 2) for p, v in WORKOUT_SCORE_PER_SESSION.items()})
    if bmi(profile) >= 30 and profile["goal"] == "weight-loss":
        add(OBESE_WEIGHT_LOSS_SCORE)
    return scores


def _pick(rng, options, weights):
    weights = np.asarray(weights, dtype=float)
    return options[rng.choice(len(options), p=weights / weights.sum())]


def sample_profile(rng: np.random.Generator) -> dict:
    occupation = _pick(rng, ["student", "professional", "retired", "other"], [25, 45, 15, 15])
    age_range = {"student": (17, 26), "professional": (22, 58), "retired": (58, 80), "other": (20, 70)}[occupation]
    age = int(rng.integers(age_range[0], age_range[1] + 1))

    sex = _pick(rng, ["female", "male", "unspecified"], [48, 48, 4])
    mean_height = {"female": 157, "male": 170, "unspecified": 164}[sex]
    height_cm = float(np.clip(rng.normal(mean_height, 7), 140, 200))
    body_mass_index = float(np.clip(rng.normal(24, 4), 16, 42))
    weight_kg = round(body_mass_index * (height_cm / 100) ** 2, 1)

    goal_weights = {
        "student": [30, 35, 35],
        "professional": [40, 25, 35],
        "retired": [25, 5, 70],
        "other": [35, 20, 45],
    }[occupation]
    goal = _pick(rng, ["weight-loss", "muscle", "wellness"], goal_weights)

    activity_weights = [20, 50, 30] if goal == "muscle" else [45, 45, 10]
    activity = _pick(rng, ["sedentary", "moderate", "very-active"], activity_weights)
    workout_mean = {"sedentary": 0.5, "moderate": 2.5, "very-active": 5}[activity]
    workouts_per_week = int(np.clip(rng.poisson(workout_mean), 0, 14))

    budget_weights = {
        "student": [50, 35, 12, 3],
        "professional": [10, 35, 35, 20],
        "retired": [35, 40, 20, 5],
        "other": [25, 40, 25, 10],
    }[occupation]
    budget = _pick(rng, ["under-150", "150-300", "300-500", "500-plus"], budget_weights)

    meals_weights = [20, 50, 30] if goal == "muscle" else [35, 50, 15]
    meals_per_day = int(_pick(rng, [1, 2, 3], meals_weights))

    diet = _pick(rng, ["vegetarian", "non-vegetarian", "eggetarian", "vegan"], [40, 40, 15, 5])
    restrictions = [r for r in RESTRICTIONS if rng.random() < 0.08]

    return {
        "age": age,
        "sex": sex,
        "height_cm": round(height_cm, 1),
        "weight_kg": weight_kg,
        "goal": goal,
        "activity": activity,
        "workouts_per_week": workouts_per_week,
        "diet": diet,
        "occupation": occupation,
        "budget": budget,
        "meals_per_day": meals_per_day,
        "restrictions": restrictions,
    }


def generate(n: int, seed: int = 42):
    """Return (profiles, labels, noise_free_labels)."""
    rng = np.random.default_rng(seed)
    profiles, labels, ideal = [], [], []
    for _ in range(n):
        profile = sample_profile(rng)
        scores = preference_scores(profile)
        noisy = scores + rng.gumbel(scale=NOISE_SCALE, size=len(PLANS))
        profiles.append(profile)
        labels.append(PLANS[int(np.argmax(noisy))])
        ideal.append(PLANS[int(np.argmax(scores))])
    return profiles, labels, ideal
