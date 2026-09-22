# Annam Kitchen

A full-stack starter for a meal-planning and food-ordering app using a Next.js frontend and a Flask backend.

## Stack

- Frontend: Next.js
- Backend: Flask
- Styling: Tailwind CSS
- UI: React + shadcn-inspired components

## Prerequisites

- Node.js 18+
- Python 3.11+
- npm
- pip

## Environment setup

Copy the example environment file:

```bash
copy .env.example .env
```

Then update the values if needed.

## Frontend setup

```bash
npm install
npm run dev -- --hostname 0.0.0.0
```

Open:

```text
http://localhost:3000
```

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Open:

```text
http://localhost:5000
```

## Backend routes

- GET /
- GET /about
- GET /dashboard
- GET /health
- POST /auth/login
- POST /auth/register
- POST /auth/logout

## Git hygiene

The project is set to ignore local virtual environments and Python cache files so they are not accidentally pushed:

- .venv/
- venv/
- __pycache__/
- *.py[cod]

## Notes

- The Next.js app is the main frontend.
- The Flask app is a backend API starter and can be expanded with real database logic, auth, and order workflows.
