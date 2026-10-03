# Plan recommendation model

Powers the **AI Plan Finder** page (`/plan-finder`). Given a customer's
profile it predicts which plan fits best — `workweek`, `macro-fit`, or
`essential` — with a probability for each and the top reasons.

Code: `backend/app/ml/`. API: [api.md](api.md#post-apiplan-finderpredict).

## Important: what the model learns from

We have **no real customer data yet**. The model is bootstrapped from 20,000
simulated profiles (`synthetic.py`) whose labels come from business
assumptions in `PREFERENCE_RULES` — e.g. "a student on under ₹150/day leans
towards Essential", "a muscle goal leans towards Macro-Fit" — plus random
noise, because real people don't always pick the obvious plan.

So today the model is a smooth, explainable encoding of those assumptions,
not a discovery of real behaviour. **Review `PREFERENCE_RULES` as a team** —
they are the single biggest lever on its recommendations until real data
arrives.

## How it gets better

1. Every prediction is stored in the `plan_predictions` table.
2. When a user clicks the plan they'd actually choose, `chosen_plan` is saved.
3. Retraining mixes those real rows in at 5× weight (`REAL_SAMPLE_WEIGHT` in
   `train.py`), so real behaviour gradually overrides the assumptions.

Once a few hundred real choices exist, evaluate on real rows only and
consider lowering the synthetic sample count.

## Model

- Multinomial logistic regression on one-hot categorical inputs + scaled
  numeric inputs (age, BMI, workouts/week). Chosen because it is
  explainable: each input's push toward a plan is `coefficient × value`,
  which the API turns into the "Why this plan" reasons.
- Features: age, age band, BMI, sex, goal, activity, workouts/week, diet,
  occupation, budget, meals/day, and each restriction.

Hold-out results on synthetic data (v1):

| Metric | Value |
|---|---|
| Accuracy | 81.5% |
| Always-guess-most-common baseline | 44.5% |
| Gradient boosting (for comparison) | 81.2% |
| Ceiling (perfect knowledge of the rules) | 81.3% |

Accuracy can't exceed the ceiling because the labels include deliberate
noise; the model matches it, and a more complex model doesn't help.

## Training

The backend trains a model automatically on first start if none exists
(takes ~20 s). To retrain — e.g. after editing the rules or collecting real
choices — run from `backend/`:

```bash
python -m app.ml.train
```

The model is saved to `backend/instance/ml/plan_model.joblib` (gitignored)
and the running server picks up the new file on the next request.
