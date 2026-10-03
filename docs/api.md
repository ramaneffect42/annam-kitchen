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
