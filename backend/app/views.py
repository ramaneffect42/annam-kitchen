from flask import Blueprint, jsonify

from app.services.demo_service import get_demo_message

views_bp = Blueprint("views", __name__)


@views_bp.get("/")
def home():
    return jsonify({
        "message": get_demo_message(),
        "status": "ok",
        "project": "annam-kitchen",
        "page": "home"
    })


@views_bp.get("/about")
def about():
    return jsonify({
        "message": "Annam Kitchen backend API",
        "status": "ok",
        "page": "about"
    })


@views_bp.get("/dashboard")
def dashboard():
    return jsonify({
        "status": "ok",
        "page": "dashboard",
        "user": "demo_customer",
        "modules": ["orders", "menu", "analytics"]
    })
