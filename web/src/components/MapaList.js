import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mapasAPI } from '../services/api';
import '../styles/MapaList.css';
import logo from '../assets/images/logo.png';

function MapaList() {
    const [mapas, setMapas] = useState([]);
    const [novoMapa, setNovoMapa] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [excluindo, setExcluindo] = useState(null);

    useEffect(() => {
        carregarMapas();
    }, []);

    const carregarMapas = async () => {
        try {
            setLoading(true);
            const response = await mapasAPI.getAll();
            setMapas(response.data);
            setError(null);
        } catch (error) {
            console.error('Erro ao carregar mapas:', error);
            setError('Não foi possível conectar ao servidor. Verifique se a API está rodando na porta 5000.');
        } finally {
            setLoading(false);
        }
    };

    const handleCriarMapa = async () => {
        if (novoMapa.trim() === '') {
            setError('Digite um nome para o mapa');
            return;
        }
        
        try {
            setLoading(true);
            await mapasAPI.create(novoMapa);
            setNovoMapa('');
            await carregarMapas();
            setError(null);
        } catch (error) {
            console.error('Erro ao criar mapa:', error);
            setError('Erro ao criar mapa. Verifique a conexão com o servidor.');
            setLoading(false);
        }
    };

    const handleExcluirMapa = async (mapaId, mapaNome) => {
        if (!window.confirm(`Tem certeza que deseja excluir o mapa "${mapaNome}"?\n\nTodos os pontos associados também serão removidos.`)) {
            return;
        }

        try {
            setExcluindo(mapaId);
            await mapasAPI.deleteMapa(mapaId);
            await carregarMapas();
        } catch (error) {
            console.error('Erro ao excluir mapa:', error);
            alert('Erro ao excluir mapa. Tente novamente.');
        } finally {
            setExcluindo(null);
        }
    };

    if (loading && mapas.length === 0) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Carregando mapas...</p>
            </div>
        );
    }

    return (
        <div className="mapa-list-container">
            <header className="header">
                <div className="container header-content">
                    <div className="logo-section">
                        <img 
                            src={logo} 
                            alt="GeoMark Manager Logo" 
                            className="logo"
                        />
                        <div className="title-section">
                            <h1>GeoMark Manager</h1>
                            <p className="subtitle">Sistema de Gerenciamento de Mapas Interativos</p>
                        </div>
                    </div>
                    <div className="header-info">
                        <small>Teste Técnico - NerdMonster</small>
                    </div>
                </div>
            </header>

            <main className="container main-content">
                {error && (
                    <div className="alert alert-error">
                        <strong>Atenção:</strong> {error}
                        <br/>
                        <small>Execute a API: <code>cd api && python app.py</code></small>
                    </div>
                )}

                <div className="criar-mapa-card">
                    <h2>🆕 Criar Novo Mapa</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Digite o nome do mapa..."
                            value={novoMapa}
                            onChange={(e) => setNovoMapa(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCriarMapa()}
                            disabled={loading}
                        />
                        <button 
                            onClick={handleCriarMapa}
                            disabled={!novoMapa.trim() || loading}
                            className="btn-criar"
                        >
                            {loading ? 'Criando...' : 'Criar Mapa'}
                        </button>
                    </div>
                    <p className="card-hint">
                        Crie um mapa para começar a adicionar pontos geográficos!
                    </p>
                </div>

                <h2 className="section-title">🗺️ Meus Mapas</h2>
                
                <div className="mapas-grid">
                    {mapas.map(mapa => (
                        <div className="mapa-card" key={mapa.id}>
                            <div className="mapa-card-header">
                                <h3>{mapa.nome}</h3>
                                <button 
                                    className="btn-excluir-mapa"
                                    onClick={() => handleExcluirMapa(mapa.id, mapa.nome)}
                                    disabled={excluindo === mapa.id}
                                    title="Excluir mapa"
                                >
                                    {excluindo === mapa.id ? '🗑️ Excluindo...' : '🗑️ Excluir'}
                                </button>
                            </div>
                            <div className="mapa-card-body">
                                <p className="mapa-data">
                                    <strong>Criado em:</strong> {new Date(mapa.data_criacao).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="mapa-data">
                                    <strong>ID:</strong> {mapa.id}
                                </p>
                                <div className="mapa-info">
                                    <span className="badge">
                                        📍 {mapa.pontos_count} {mapa.pontos_count === 1 ? 'ponto' : 'pontos'}
                                    </span>
                                    <Link 
                                        to={`/mapa/${mapa.id}`} 
                                        className="btn-acessar"
                                    >
                                        🔍 Acessar Mapa
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {mapas.length === 0 && !error && (
                    <div className="sem-mapas">
                        <div className="empty-state">
                            <div className="empty-icon">🗺️</div>
                            <h3>Nenhum mapa criado ainda</h3>
                            <p>Crie seu primeiro mapa usando o formulário acima!</p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="footer">
                <div className="container">
                    <p>Sistema GeoMark Manager &copy; {new Date().getFullYear()} - Teste Técnico NerdMonster</p>
                </div>
            </footer>
        </div>
    );
}

export default MapaList;