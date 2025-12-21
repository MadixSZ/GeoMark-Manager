import os
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import init_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    init_routes(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    with app.app_context():
        try:
            db.create_all()
            print("=" * 60)
            print("✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!")
            print("=" * 60)
            print("🌐 API rodando em: http://localhost:5000")
            print("📊 Health Check: http://localhost:5000/api/health")
            print("📋 Endpoints disponíveis:")
            print("   GET    /api/mapas")
            print("   POST   /api/mapas")
            print("   DELETE /api/mapas/<id>")
            print("   GET    /api/mapas/<id>/pontos")
            print("   POST   /api/mapas/<id>/pontos")
            print("   PUT    /api/pontos/<id>")
            print("   DELETE /api/pontos/<id>")
            print("   DELETE /api/mapas/<id>/pontos")
            print("   GET    /api/health")
            print("=" * 60)
            print("💡 Dica: Execute o frontend em outro terminal:")
            print("         cd web && npm start")
            print("=" * 60)
        except Exception as e:
            print(f"❌ ERRO AO INICIALIZAR BANCO DE DADOS: {e}")
            print("💡 Solução:")
            print("   1. Delete o arquivo data/database.db")
            print("   2. Verifique se models.py tem __tablename__")
            print("   3. Execute novamente")
            import traceback
            traceback.print_exc()
    
    app.run(debug=True, host='0.0.0.0', port=5000)