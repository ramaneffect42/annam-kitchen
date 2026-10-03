from flask import Flask

from app.auth import auth_bp
from app.config import Config
from app.db import init_db
from app.errors import register_error_handlers
from app.extensions import init_extensions
from app.views import views_bp
from app.waitlist import waitlist_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    init_extensions(app)
    init_db(app)
    register_error_handlers(app)
    app.register_blueprint(views_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(waitlist_bp)

    return app
