# Annam Kitchen API

The single source of truth for how the Next.js frontend (`lib/api.ts`) and the
Flask backend (`backend/app/`) talk to each other. Change this file first when
adding or changing an endpoint, then update both sides.

## Conventions

- **Base URL:** `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).
- **Prefix:** every frontend-facing endpoint lives under `/api`.
- **Format:** JSON request and response bodies (`Content-Type: application/json`).
- **CORS:** allowed origins come from `CORS_ORIGINS` (comma-separated, default
  `http://localhost:3000`).
- **Response envelope** — every response, including errors and 404s:

  ```json
  { "status": "success" | "error", "message": "Human-readable text", "data": { } }
  ```

  `data` is present only on success responses that return something. `message`
  on an error is safe to show to the user.

## Implemented

### `POST /api/waitlist`

Adds someone to the pre-launch waitlist (stored in SQLite).

Request:

```json
{
  "full_name": "Priya Sharma",
  "email": "priya@example.com",
  "plan_interest": "9-to-5 Workweek",
  "source": "landing_waitlist"
}
```

- `full_name` — required, 1–120 characters.
- `email` — required, valid email. Stored lowercased; unique.
- `plan_interest` — one of `Student Budget Plan`, `9-to-5 Workweek`,
  `Gym High-Protein` (must match the landing page plans).
- `source` — optional, defaults to `landing_waitlist`.

Responses:

| Status | When | `data` |
|---|---|---|
| `201` | New signup | `{ full_name, email, plan_interest, already_registered: false }` |
| `200` | Email already on the list | `{ ..., already_registered: true }` |
| `400` | Validation failed | — (`message` says which field) |

### `POST /api/plan-finder/predict`

Predicts the best plan with the ML model (see [ml.md](ml.md)) and stores the
prediction so the user's eventual choice can be used for retraining.

Request (all fields required; `restrictions` may be empty):

```json
{
  "age": 29,
  "sex": "female",
  "height_cm": 162.5,
  "weight_kg": 58,
  "goal": "muscle",
  "activity": "very-active",
  "workouts_per_week": 5,
  "diet": "vegetarian",
  "occupation": "professional",
  "budget": "300-500",
  "meals_per_day": 2,
  "restrictions": ["nuts"]
}
```

| Field | Allowed values |
|---|---|
| `age` | integer 13–100 |
| `height_cm` / `weight_kg` | 120–230 / 30–250 |
| `workouts_per_week` | integer 0–14 |
| `meals_per_day` | integer 1–3 |
| `sex` | `female`, `male`, `unspecified` |
| `goal` | `weight-loss`, `muscle`, `wellness` |
| `activity` | `sedentary`, `moderate`, `very-active` |
| `diet` | `vegetarian`, `non-vegetarian`, `eggetarian`, `vegan` |
| `occupation` | `student`, `professional`, `retired`, `other` |
| `budget` (₹/day) | `under-150`, `150-300`, `300-500`, `500-plus` |
| `restrictions` | any of `dairy`, `gluten`, `nuts`, `soy`, `low-sodium` |

`200` response `data`:

```json
{
  "prediction_id": 42,
  "plan": "macro-fit",
  "confidence": 0.78,
  "probabilities": { "workweek": 0.04, "macro-fit": 0.78, "essential": 0.18 },
  "reasons": [{ "feature": "goal", "text": "Your goal is building muscle", "impact": 1.9 }],
  "model": { "version": "1", "trained_at": "2026-10-03T16:42:50+00:00", "real_samples": 0 }
}
```

Plan ids: `workweek`, `macro-fit`, `essential`. `400` if any field is invalid.

### `POST /api/plan-finder/predictions/:id/choice`

Records the plan the user actually chose — this becomes real training data.

Request: `{ "plan": "essential" }`. Responses: `200`, `400` (bad plan),
`404` (unknown prediction id).

### `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`

Placeholder stubs: they validate required fields and echo them back, but there
is no user storage, password check, or token. Not used by the frontend.

## Planned (not implemented yet)

These are referenced in `lib/api.ts` or the UI but have no backend route. They
currently return `404`.

- `POST /api/auth/send-otp` — `{ phone }`
- `POST /api/auth/verify-otp` — `{ phone, code, name? }` → `{ token, user }`
- `GET /api/menu`
- `POST /api/orders`, `GET /api/orders/:id`
- `POST /api/payments/verify`
