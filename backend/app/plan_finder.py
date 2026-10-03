import json

from flask import Blueprint, jsonify, request

from app.db import get_db
from app.ml.features import PLANS, ValidationError, validate
from app.ml.model import predict

plan_finder_bp = Blueprint("plan_finder", __name__, url_prefix="/api/plan-finder")


def error(message, status=400):
    return jsonify({"status": "error", "message": message}), status


@plan_finder_bp.post("/predict")
def predict_plan():
    try:
        profile = validate(request.get_json(silent=True) or {})
    except ValidationError as exc:
        return error(str(exc))

    result = predict(profile)

    db = get_db()
    cursor = db.execute(
        "INSERT INTO plan_predictions (profile_json, predicted_plan, probabilities_json, model_version)"
        " VALUES (?, ?, ?, ?)",
        (json.dumps(profile), result["plan"], json.dumps(result["probabilities"]), result["model"]["version"]),
    )
    db.commit()

    return jsonify({
        "status": "success",
        "message": "Plan predicted.",
        "data": {"prediction_id": cursor.lastrowid, **result},
    })


@plan_finder_bp.post("/predictions/<int:prediction_id>/choice")
def record_choice(prediction_id: int):
    plan = (request.get_json(silent=True) or {}).get("plan")
    if plan not in PLANS:
        return error(f"'plan' must be one of: {', '.join(PLANS)}.")

    db = get_db()
    cursor = db.execute(
        "UPDATE plan_predictions SET chosen_plan = ?, chosen_at = CURRENT_TIMESTAMP WHERE id = ?",
        (plan, prediction_id),
    )
    db.commit()
    if cursor.rowcount == 0:
        return error("Prediction not found.", 404)

    return jsonify({"status": "success", "message": "Choice recorded."})
