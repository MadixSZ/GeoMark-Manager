import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { mapasAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../styles/MapaDetalhe.css';

// Fix para ícones do Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pontos, setPontos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [novoPonto, setNovoPonto] = useState({ nome: '', latitude: 0, longitude: 0 });
    const [editando, setEditando] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarPontos();
    }, [id]);

    const carregarPontos = async () => {
        try {
            const response = await mapasAPI.getPontos(id);
            setPontos(response.data);
        } catch (error) {
            console.error('Erro ao carregar pontos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (e) => {
        setNovoPonto({
            nome: '',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
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
            if (editando) {
                await mapasAPI.updatePonto(editando.id, novoPonto.nome);
            } else {
                await mapasAPI.createPonto(id, novoPonto);
            }
            setShowModal(false);
            setNovoPonto({ nome: '', latitude: 0, longitude: 0 });
            setEditando(null);
            carregarPontos();
        } catch (error) {
            console.error('Erro ao salvar ponto:', error);
        }
    };

    const handleExcluirPonto = async (pontoId) => {
        if (window.confirm('Tem certeza que deseja excluir este ponto?')) {
            try {
                await mapasAPI.deletePonto(pontoId);
                carregarPontos();
            } catch (error) {
                console.error('Erro ao excluir ponto:', error);
            }
        }
    };

    const handleExcluirTodos = async () => {
        if (window.confirm('Tem certeza que deseja excluir TODOS os pontos deste mapa?')) {
            try {
                await mapasAPI.deleteAllPontos(id);
                carregarPontos();
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

    const MapClickHandler = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    if (loading) {
        return <div className="loading">Carregando mapa...</div>;
    }

    return (
        <div className="mapa-detalhe-container">
            <nav className="navbar">
                <div className="container">
                    <span className="navbar-brand">
                        Mapa ID: {id} | Pontos: {pontos.length}
                    </span>
                    <div className="navbar-buttons">
                        <button 
                            className="btn-voltar"
                            onClick={() => navigate('/')}
                        >
                            Voltar
                        </button>
                        <button 
                            className="btn-excluir-todos"
                            onClick={handleExcluirTodos}
                            disabled={pontos.length === 0}
                        >
                            Excluir Todos os Pontos
                        </button>
                    </div>
                </div>
            </nav>

            <div className="mapa-conteudo">
                <div className="mapa-wrapper">
                    <MapContainer
                        center={[-15.788, -47.879]}
                        zoom={4}
                        className="mapa-leaflet"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapClickHandler />
                        
                        {pontos.map(ponto => (
                            <Marker 
                                key={ponto.id} 
                                position={[ponto.latitude, ponto.longitude]}
                            >
                                <Popup>
                                    <strong>{ponto.nome}</strong><br/>
                                    Lat: {ponto.latitude.toFixed(4)}<br/>
                                    Lng: {ponto.longitude.toFixed(4)}<br/>
                                    <div className="ponto-buttons">
                                        <button 
                                            className="btn-editar"
                                            onClick={() => handleEditarPonto(ponto)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-excluir"
                                            onClick={() => handleExcluirPonto(ponto.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="lista-pontos">
                    <h4>Pontos Cadastrados</h4>
                    <div className="list-group">
                        {pontos.map(ponto => (
                            <div key={ponto.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="ponto-info">
                                        <h6>{ponto.nome}</h6>
                                        <small>
                                            Lat: {ponto.latitude.toFixed(4)}, 
                                            Lng: {ponto.longitude.toFixed(4)}
                                        </small>
                                    </div>
                                    <div className="ponto-buttons">
                                        <button 
                                            className="btn-editar"
                                            onClick={() => handleEditarPonto(ponto)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-excluir"
                                            onClick={() => handleExcluirPonto(ponto.id)}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {pontos.length === 0 && (
                        <div className="sem-pontos">
                            <p>
                                Nenhum ponto cadastrado.<br/>
                                Clique no mapa para adicionar o primeiro ponto!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {editando ? 'Editar Ponto' : 'Novo Ponto'}
                            </h5>
                            <button 
                                className="btn-close" 
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nome do Ponto</label>
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
                                />
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label className="form-label">Latitude</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={novoPonto.latitude}
                                        readOnly
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label">Longitude</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={novoPonto.longitude}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleSalvarPonto}
                            >
                                {editando ? 'Atualizar' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapaDetalhe;