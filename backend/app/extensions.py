from flask import Flask
from flask_cors import CORS


def init_extensions(app: Flask):
    """Initialize third-party Flask extensions here."""
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
