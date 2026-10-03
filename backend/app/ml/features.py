"""Input schema for the plan-recommendation model.

Shared by training (synthetic + real rows) and serving so both encode
features identically.
"""

PLANS = ("workweek", "macro-fit", "essential")

SEXES = ("female", "male", "unspecified")
GOALS = ("weight-loss", "muscle", "wellness")
ACTIVITIES = ("sedentary", "moderate", "very-active")
DIETS = ("vegetarian", "non-vegetarian", "eggetarian", "vegan")
OCCUPATIONS = ("student", "professional", "retired", "other")
BUDGETS = ("under-150", "150-300", "300-500", "500-plus")
RESTRICTIONS = ("dairy", "gluten", "nuts", "soy", "low-sodium")

LIMITS = {
    "age": (13, 100),
    "height_cm": (120, 230),
    "weight_kg": (30, 250),
    "workouts_per_week": (0, 14),
    "meals_per_day": (1, 3),
}

CHOICES = {
    "sex": SEXES,
    "goal": GOALS,
    "activity": ACTIVITIES,
    "diet": DIETS,
    "occupation": OCCUPATIONS,
    "budget": BUDGETS,
}


class ValidationError(ValueError):
    pass


def validate(payload: dict) -> dict:
    """Return a clean profile dict or raise ValidationError with a user-facing message."""
    profile = {}
    for field, (low, high) in LIMITS.items():
        value = payload.get(field)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValidationError(f"'{field}' must be a number.")
        if not low <= value <= high:
            raise ValidationError(f"'{field}' must be between {low} and {high}.")
        profile[field] = float(value)
    for field in ("age", "workouts_per_week", "meals_per_day"):
        if not profile[field].is_integer():
            raise ValidationError(f"'{field}' must be a whole number.")
        profile[field] = int(profile[field])

    for field, options in CHOICES.items():
        value = payload.get(field)
        if value not in options:
            raise ValidationError(f"'{field}' must be one of: {', '.join(options)}.")
        profile[field] = value

    restrictions = payload.get("restrictions", [])
    if not isinstance(restrictions, list) or any(r not in RESTRICTIONS for r in restrictions):
        raise ValidationError(f"'restrictions' must be a list of: {', '.join(RESTRICTIONS)}.")
    profile["restrictions"] = sorted(set(restrictions))
    return profile


def bmi(profile: dict) -> float:
    return profile["weight_kg"] / (profile["height_cm"] / 100) ** 2


def age_band(age: int) -> str:
    if age <= 22:
        return "13-22"
    if age <= 35:
        return "23-35"
    if age <= 59:
        return "36-59"
    return "60-plus"


def to_feature_dict(profile: dict) -> dict:
    """Encode a validated profile for sklearn's DictVectorizer.

    String values become one-hot columns named "<feature>=<value>".
    """
    features = {
        "age": profile["age"],
        "bmi": bmi(profile),
        "workouts_per_week": profile["workouts_per_week"],
        "age_band": age_band(profile["age"]),
        "sex": profile["sex"],
        "goal": profile["goal"],
        "activity": profile["activity"],
        "diet": profile["diet"],
        "occupation": profile["occupation"],
        "budget": profile["budget"],
        "meals_per_day": str(profile["meals_per_day"]),
    }
    for restriction in RESTRICTIONS:
        features[f"no_{restriction}"] = 1.0 if restriction in profile["restrictions"] else 0.0
    return features


def feature_group(column: str) -> str:
    """Map a vectorized column name back to the input it came from."""
    name = column.split("=")[0]
    return "age" if name == "age_band" else name


_LABELS = {
    "occupation": {
        "student": "You're a student",
        "professional": "You're a working professional",
        "retired": "You're retired",
        "other": "Your daily routine",
    },
    "goal": {
        "weight-loss": "Your goal is weight loss",
        "muscle": "Your goal is building muscle",
        "wellness": "Your goal is everyday wellness",
    },
    "budget": {
        "under-150": "Your daily budget is under ₹150",
        "150-300": "Your daily budget is ₹150–300",
        "300-500": "Your daily budget is ₹300–500",
        "500-plus": "Your daily budget is ₹500+",
    },
    "activity": {
        "sedentary": "You're mostly sedentary",
        "moderate": "You're moderately active",
        "very-active": "You're very active",
    },
    "diet": {
        "vegetarian": "You eat vegetarian",
        "non-vegetarian": "You eat non-vegetarian",
        "eggetarian": "You eat eggetarian",
        "vegan": "You eat vegan",
    },
    "sex": {"female": "Your sex", "male": "Your sex", "unspecified": "Your profile"},
}


def describe(group: str, profile: dict) -> str:
    """Human-readable reason for a feature group, given the user's inputs."""
    if group in _LABELS:
        return _LABELS[group][profile[group]]
    if group == "age":
        return f"You're {profile['age']}"
    if group == "bmi":
        return f"Your BMI is {bmi(profile):.1f}"
    if group == "workouts_per_week":
        n = profile["workouts_per_week"]
        return "You don't work out regularly" if n == 0 else f"You work out {n}× a week"
    if group == "meals_per_day":
        n = profile["meals_per_day"]
        return f"You want {n} meal{'s' if n > 1 else ''} a day"
    if group.startswith("no_"):
        restriction = group[3:]
        return "You prefer low-sodium food" if restriction == "low-sodium" else f"You avoid {restriction}"
    return group
