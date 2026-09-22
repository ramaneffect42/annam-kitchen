from flask import Blueprint, jsonify

from app.services.demo_service import get_demo_message

main_bp = Blueprint("main", __name__)


@main_bp.get("/")
def home():
    return jsonify({
        "message": get_demo_message(),
        "status": "ok",
        "project": "annam-kitchen"
    })


@main_bp.get("/about")
def about():
    return jsonify({
        "message": "Annam Kitchen backend API",
        "status": "ok"
    })
