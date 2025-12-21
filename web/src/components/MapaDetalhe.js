import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useMapEvents } from 'react-leaflet/hooks';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { mapasAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../styles/MapaDetalhe.css';
import logo from '../assets/images/logo.png';

// Configurar ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

// Componente para controlar a visualização do mapa
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function MapaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pontos, setPontos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [novoPonto, setNovoPonto] = useState({ 
        nome: '', 
        latitude: 0, 
        longitude: 0 
    });
    const [editando, setEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para pesquisa de endereço
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([-15.788, -47.879]);
    const [mapZoom, setMapZoom] = useState(4);

    // Carregar pontos
    const carregarPontos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await mapasAPI.getPontos(id);
            setPontos(response.data);
            setError(null);
        } catch (error) {
            console.error('Erro ao carregar pontos:', error);
            setError('Não foi possível carregar os pontos. Verifique a conexão.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarPontos();
    }, [carregarPontos]);

    // Função para pesquisar endereço
    const pesquisarEndereco = async () => {
        if (!searchQuery.trim()) {
            alert('Digite um endereço para pesquisar');
            return;
        }

        try {
            setSearchLoading(true);
            
            // Usando Nominatim API (OpenStreetMap)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            
            if (!response.ok) {
                throw new Error('Erro na pesquisa');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                alert('Endereço não encontrado. Tente outro endereço.');
                return;
            }
            
            const { lat, lon, display_name } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            // Mover o mapa para o local encontrado
            setMapCenter([latitude, longitude]);
            setMapZoom(15);
            
            // Salvar resultado da pesquisa
            setSearchResult({
                latitude,
                longitude,
                nome: display_name
            });
            
            // Sugerir criação de ponto
            if (window.confirm(`Encontrado: ${display_name}\n\nDeseja adicionar este local como um ponto no mapa?`)) {
                setNovoPonto({
                    nome: display_name.split(',')[0], 
                    latitude,
                    longitude
                });
                setEditando(null);
                setShowModal(true);
            }
            
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            alert('Erro ao pesquisar endereço. Verifique sua conexão ou tente outro endereço.');
        } finally {
            setSearchLoading(false);
        }
    };

    // Limpar pesquisa
    const limparPesquisa = () => {
        setSearchQuery('');
        setSearchResult(null);
        setMapCenter([-15.788, -47.879]);
        setMapZoom(4);
    };

    const handleMapClick = (latlng) => {
        setNovoPonto({
            nome: '',
            latitude: latlng.lat,
            longitude: latlng.lng
        });
        setEditando(null);
        setShowModal(true);
    };

    const handleSalvarPonto = async () => {
        if (!novoPonto.nome.trim()) {
            alert('O nome do ponto é obrigatório');
            return;
        }

        try {
            setLoading(true);
            if (editando) {
                await mapasAPI.updatePonto(editando.id, novoPonto.nome);
            } else {
                await mapasAPI.createPonto(id, novoPonto);
            }
            setShowModal(false);
            setNovoPonto({ nome: '', latitude: 0, longitude: 0 });
            setEditando(null);
            await carregarPontos();
        } catch (error) {
            console.error('Erro ao salvar ponto:', error);
            alert('Erro ao salvar ponto. Tente novamente.');
            setLoading(false);
        }
    };

    const handleExcluirPonto = async (pontoId) => {
        if (window.confirm('Tem certeza que deseja excluir este ponto?')) {
            try {
                await mapasAPI.deletePonto(pontoId);
                await carregarPontos();
            } catch (error) {
                console.error('Erro ao excluir ponto:', error);
            }
        }
    };

    const handleExcluirTodos = async () => {
        if (pontos.length === 0) return;
        
        if (window.confirm(`Tem certeza que deseja excluir TODOS os ${pontos.length} pontos deste mapa?`)) {
            try {
                await mapasAPI.deleteAllPontos(id);
                await carregarPontos();
            } catch (error) {
                console.error('Erro ao excluir pontos:', error);
            }
        }
    };

    const handleEditarPonto = (ponto) => {
        setNovoPonto({
            nome: ponto.nome,
            latitude: ponto.latitude,
            longitude: ponto.longitude
        });
        setEditando(ponto);
        setShowModal(true);
    };

    if (loading && pontos.length === 0) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Carregando mapa...</p>
            </div>
        );
    }

    return (
        <div className="mapa-detalhe-container">
            <nav className="navbar">
                <div className="container navbar-content">
                    <div className="logo-section">
                        <img 
                            src={logo} 
                            alt="GeoMark Manager Logo" 
                            className="logo-small"
                        />
                        <div className="mapa-info-header">
                            <span className="mapa-id">Mapa ID: {id}</span>
                            <span className="pontos-count">
                                📍 {pontos.length} {pontos.length === 1 ? 'ponto' : 'pontos'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="navbar-buttons">
                        <button 
                            className="btn-voltar"
                            onClick={() => navigate('/')}
                        >
                            ← Voltar
                        </button>
                        <button 
                            className="btn-excluir-todos"
                            onClick={handleExcluirTodos}
                            disabled={pontos.length === 0}
                        >
                            🗑️ Excluir Todos
                        </button>
                    </div>
                </div>
            </nav>

            {/* Barra de pesquisa de endereço */}
            <div className="search-bar-container">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Pesquisar endereço (ex: Rua das Flores, 123, São Paulo, SP)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && pesquisarEndereco()}
                        disabled={searchLoading}
                    />
                    <button 
                        onClick={pesquisarEndereco}
                        disabled={searchLoading || !searchQuery.trim()}
                        className="btn-search"
                    >
                        {searchLoading ? 'Pesquisando...' : 'Buscar'}
                    </button>
                    {searchResult && (
                        <button 
                            onClick={limparPesquisa}
                            className="btn-clear-search"
                        >
                            Limpar
                        </button>
                    )}
                </div>
                <div className="search-hint">
                    <small>Exemplos: "Avenida Paulista, São Paulo" ou "Copacabana, Rio de Janeiro"</small>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Erro:</strong> {error}
                </div>
            )}

            <div className="mapa-conteudo">
                <div className="mapa-wrapper">
                    <div className="mapa-instructions">
                        <span>📌 Clique no mapa para adicionar um ponto</span>
                        <span>🔍 Use a barra acima para pesquisar endereços</span>
                    </div>
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        className="mapa-leaflet"
                        scrollWheelZoom={true}
                    >
                        <ChangeView center={mapCenter} zoom={mapZoom} />
                        
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        <MapClickHandler onMapClick={handleMapClick} />
                        
                        {/* Marcador do resultado da pesquisa */}
                        {searchResult && (
                            <Marker 
                                position={[searchResult.latitude, searchResult.longitude]}
                                icon={L.icon({
                                    ...L.Icon.Default.prototype.options,
                                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
                                })}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <strong>📍 Local Encontrado</strong>
                                        <div className="popup-coords">
                                            <div><strong>{searchResult.nome}</strong></div>
                                            <div>Lat: {searchResult.latitude.toFixed(6)}</div>
                                            <div>Lng: {searchResult.longitude.toFixed(6)}</div>
                                        </div>
                                        <div className="popup-buttons">
                                            <button 
                                                className="btn-popup-add"
                                                onClick={() => {
                                                    setNovoPonto({
                                                        nome: searchResult.nome.split(',')[0],
                                                        latitude: searchResult.latitude,
                                                        longitude: searchResult.longitude
                                                    });
                                                    setEditando(null);
                                                    setShowModal(true);
                                                }}
                                            >
                                                ➕ Adicionar Ponto
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                        
                        {/* Pontos cadastrados */}
                        {pontos.map(ponto => (
                            <Marker 
                                key={ponto.id} 
                                position={[ponto.latitude, ponto.longitude]}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <strong>{ponto.nome}</strong>
                                        <div className="popup-coords">
                                            <div>Lat: {ponto.latitude.toFixed(6)}</div>
                                            <div>Lng: {ponto.longitude.toFixed(6)}</div>
                                        </div>
                                        <div className="popup-buttons">
                                            <button 
                                                className="btn-popup-editar"
                                                onClick={() => handleEditarPonto(ponto)}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                className="btn-popup-excluir"
                                                onClick={() => handleExcluirPonto(ponto.id)}
                                            >
                                                🗑️ Excluir
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="lista-pontos">
                    <div className="lista-header">
                        <h4>📋 Pontos Cadastrados</h4>
                        <span className="badge-count">{pontos.length}</span>
                    </div>
                    
                    <div className="pontos-list">
                        {pontos.map(ponto => (
                            <div key={ponto.id} className="ponto-item">
                                <div className="ponto-info">
                                    <div className="ponto-nome">
                                        <strong>{ponto.nome}</strong>
                                    </div>
                                    <div className="ponto-coords">
                                        <span>Lat: {ponto.latitude.toFixed(6)}</span>
                                        <span>Lng: {ponto.longitude.toFixed(6)}</span>
                                    </div>
                                </div>
                                <div className="ponto-actions">
                                    <button 
                                        className="btn-editar"
                                        onClick={() => handleEditarPonto(ponto)}
                                        title="Editar ponto"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="btn-excluir"
                                        onClick={() => handleExcluirPonto(ponto.id)}
                                        title="Excluir ponto"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {pontos.length === 0 && (
                        <div className="sem-pontos">
                            <div className="empty-state">
                                <div className="empty-icon">📍</div>
                                <h4>Nenhum ponto cadastrado</h4>
                                <p>Clique no mapa ou pesquise um endereço para adicionar pontos!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {editando ? '✏️ Editar Ponto' : '📍 Adicionar Novo Ponto'}
                            </h5>
                            <button 
                                className="btn-close" 
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nome do Ponto *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={novoPonto.nome}
                                    onChange={(e) => setNovoPonto({
                                        ...novoPonto,
                                        nome: e.target.value
                                    })}
                                    placeholder="Digite o nome do ponto"
                                    autoFocus
                                    disabled={loading}
                                />
                                <small className="form-text">* Campo obrigatório</small>
                            </div>
                            <div className="coords-group">
                                <div className="coord-input">
                                    <label className="form-label">Latitude</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={novoPonto.latitude.toFixed(6)}
                                        readOnly
                                    />
                                </div>
                                <div className="coord-input">
                                    <label className="form-label">Longitude</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={novoPonto.longitude.toFixed(6)}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleSalvarPonto}
                                disabled={loading || !novoPonto.nome.trim()}
                            >
                                {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapaDetalhe;