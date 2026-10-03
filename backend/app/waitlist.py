import re
import sqlite3

from flask import Blueprint, jsonify, request

from app.db import get_db

waitlist_bp = Blueprint("waitlist", __name__, url_prefix="/api/waitlist")

# Must match the plan names shown on the landing page (app/page.tsx PLANS).
PLAN_OPTIONS = ("Student Budget Plan", "9-to-5 Workweek", "Gym High-Protein")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def error(message, status=400):
    return jsonify({"status": "error", "message": message}), status


@waitlist_bp.post("")
def join_waitlist():
    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get("full_name") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    plan_interest = str(payload.get("plan_interest") or "").strip()
    source = str(payload.get("source") or "landing_waitlist").strip()[:50]

    if not full_name or len(full_name) > 120:
        return error("Please enter your name.")
    if not EMAIL_RE.match(email) or len(email) > 254:
        return error("Please enter a valid email address.")
    if plan_interest not in PLAN_OPTIONS:
        return error("Please choose a valid plan.")

    data = {"full_name": full_name, "email": email, "plan_interest": plan_interest}

    db = get_db()
    try:
        db.execute(
            "INSERT INTO waitlist (full_name, email, plan_interest, source) VALUES (?, ?, ?, ?)",
            (full_name, email, plan_interest, source),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({
            "status": "success",
            "message": "You're already on the waitlist.",
            "data": {**data, "already_registered": True},
        })

    return jsonify({
        "status": "success",
        "message": "You're on the waitlist.",
        "data": {**data, "already_registered": False},
    }), 201
