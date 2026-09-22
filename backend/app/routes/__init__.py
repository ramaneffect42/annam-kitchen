from app.routes.health import health_bp
from app.routes.main import main_bp


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(health_bp)
