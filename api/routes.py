from flask import jsonify, request
from models import db, Mapa, Ponto  

def init_routes(app):
    
    @app.route('/api/mapas', methods=['GET'])
    def get_mapas():
        mapas = Mapa.query.all()
        resultado = []
        for mapa in mapas:
            resultado.append({
                'id': mapa.id,
                'nome': mapa.nome,
                'data_criacao': mapa.data_criacao.isoformat(),
                'pontos_count': len(mapa.pontos)
            })
        return jsonify(resultado)
    
    @app.route('/api/mapas', methods=['POST'])
    def criar_mapa():
        dados = request.get_json()
        if not dados or not dados.get('nome'):
            return jsonify({'erro': 'Nome do mapa é obrigatório'}), 400
            
        novo_mapa = Mapa(nome=dados['nome'])
        db.session.add(novo_mapa)
        db.session.commit()
        
        return jsonify({
            'id': novo_mapa.id,
            'nome': novo_mapa.nome,
            'data_criacao': novo_mapa.data_criacao.isoformat()
        }), 201
    
    @app.route('/api/mapas/<int:mapa_id>', methods=['DELETE'])
    def deletar_mapa(mapa_id):
        mapa = Mapa.query.get_or_404(mapa_id)
        db.session.delete(mapa)
        db.session.commit()
        return '', 204
    
    @app.route('/api/mapas/<int:mapa_id>/pontos', methods=['GET'])
    def get_pontos(mapa_id):
        pontos = Ponto.query.filter_by(mapa_id=mapa_id).all()
        return jsonify([{
            'id': p.id,
            'nome': p.nome,
            'latitude': p.latitude,
            'longitude': p.longitude
        } for p in pontos])
    
    @app.route('/api/mapas/<int:mapa_id>/pontos', methods=['POST'])
    def criar_ponto(mapa_id):
        dados = request.get_json()
        if not dados:
            return jsonify({'erro': 'Dados inválidos'}), 400
            
        required_fields = ['nome', 'latitude', 'longitude']
        if not all(field in dados for field in required_fields):
            return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400
            
        novo_ponto = Ponto(
            nome=dados['nome'],
            latitude=dados['latitude'],
            longitude=dados['longitude'],
            mapa_id=mapa_id
        )
        
        db.session.add(novo_ponto)
        db.session.commit()
        
        return jsonify({
            'id': novo_ponto.id,
            'nome': novo_ponto.nome,
            'latitude': novo_ponto.latitude,
            'longitude': novo_ponto.longitude
        }), 201
    
    @app.route('/api/pontos/<int:ponto_id>', methods=['PUT'])
    def atualizar_ponto(ponto_id):
        ponto = Ponto.query.get_or_404(ponto_id)
        dados = request.get_json()
        
        if 'nome' in dados:
            ponto.nome = dados['nome']
            db.session.commit()
            
        return jsonify({
            'id': ponto.id,
            'nome': ponto.nome,
            'latitude': ponto.latitude,
            'longitude': ponto.longitude
        })
    
    @app.route('/api/pontos/<int:ponto_id>', methods=['DELETE'])
    def deletar_ponto(ponto_id):
        ponto = Ponto.query.get_or_404(ponto_id)
        db.session.delete(ponto)
        db.session.commit()
        return '', 204
    
    @app.route('/api/mapas/<int:mapa_id>/pontos', methods=['DELETE'])
    def deletar_todos_pontos(mapa_id):
        Ponto.query.filter_by(mapa_id=mapa_id).delete()
        db.session.commit()
        return '', 204
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'API está funcionando'})