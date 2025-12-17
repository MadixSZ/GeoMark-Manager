from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import init_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    init_routes(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Banco de dados inicializado!")
        print("🌐 API rodando em: http://localhost:5000")
        print("📋 Endpoints disponíveis:")
        print("   GET  /api/mapas")
        print("   POST /api/mapas")
        print("   GET  /api/mapas/<id>/pontos")
        print("   POST /api/mapas/<id>/pontos")
        print("   PUT  /api/pontos/<id>")
        print("   DELETE /api/pontos/<id>")
        print("   DELETE /api/mapas/<id>/pontos")
    app.run(debug=True, port=5000)