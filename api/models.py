from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Mapa(db.Model):
    __tablename__ = 'mapas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento
    pontos = db.relationship(
        'Ponto', 
        backref='mapa', 
        lazy=True, 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f'<Mapa {self.nome}>'

class Ponto(db.Model):
    __tablename__ = 'pontos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    mapa_id = db.Column(db.Integer, db.ForeignKey('mapas.id'), nullable=False)
    
    def __repr__(self):
        return f'<Ponto {self.nome} ({self.latitude}, {self.longitude})>'