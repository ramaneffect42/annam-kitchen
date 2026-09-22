from flask import Blueprint, jsonify, request

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "email": email,
            "role": "customer"
        }
    })


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    email = payload.get("email")

    if not name or not email:
        return jsonify({
            "status": "error",
            "message": "Name and email are required"
        }), 400

    return jsonify({
        "status": "success",
        "message": "Registration successful",
        "user": {
            "name": name,
            "email": email,
            "role": "customer"
        }
    })


@auth_bp.post("/logout")
def logout():
    return jsonify({
        "status": "success",
        "message": "Logged out successfully"
    })
