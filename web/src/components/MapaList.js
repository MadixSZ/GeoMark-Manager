import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mapasAPI } from '../services/api';
import '../styles/MapaList.css';

function MapaList() {
    const [mapas, setMapas] = useState([]);
    const [novoMapa, setNovoMapa] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarMapas();
    }, []);

    const carregarMapas = async () => {
        try {
            const response = await mapasAPI.getAll();
            setMapas(response.data);
        } catch (error) {
            console.error('Erro ao carregar mapas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCriarMapa = async () => {
        if (novoMapa.trim() === '') return;
        
        try {
            await mapasAPI.create(novoMapa);
            setNovoMapa('');
            carregarMapas();
        } catch (error) {
            console.error('Erro ao criar mapa:', error);
        }
    };

    if (loading) {
        return <div className="loading">Carregando mapas...</div>;
    }

    return (
        <div className="mapa-list-container">
            <header className="header">
                <div className="container">
                    <h1>Meus Mapas</h1>
                </div>
            </header>

            <main className="container main-content">
                <div className="criar-mapa-card">
                    <h2>Criar Novo Mapa</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nome do mapa..."
                            value={novoMapa}
                            onChange={(e) => setNovoMapa(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCriarMapa()}
                        />
                        <button 
                            onClick={handleCriarMapa}
                            disabled={!novoMapa.trim()}
                        >
                            Criar
                        </button>
                    </div>
                </div>

                <div className="mapas-grid">
                    {mapas.map(mapa => (
                        <div className="mapa-card" key={mapa.id}>
                            <div className="mapa-card-body">
                                <h3>{mapa.nome}</h3>
                                <p className="mapa-data">
                                    Criado em: {new Date(mapa.data_criacao).toLocaleDateString()}
                                </p>
                                <div className="mapa-info">
                                    <span className="badge">
                                        {mapa.pontos_count} {mapa.pontos_count === 1 ? 'ponto' : 'pontos'}
                                    </span>
                                    <Link 
                                        to={`/mapa/${mapa.id}`} 
                                        className="btn"
                                    >
                                        Acessar Mapa
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {mapas.length === 0 && (
                    <div className="sem-mapas">
                        <p>Nenhum mapa criado ainda. Crie o primeiro!</p>
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>Sistema Meus Mapas &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}

export default MapaList;