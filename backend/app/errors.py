from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app: Flask):
    """Return every error as JSON so the frontend can always parse the response."""

    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        return jsonify({"status": "error", "message": exc.description}), exc.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        app.logger.exception(exc)
        return jsonify({"status": "error", "message": "Something went wrong. Please try again."}), 500
