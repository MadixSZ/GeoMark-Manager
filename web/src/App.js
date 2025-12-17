import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import MapaList from './components/MapaList';
import MapaDetalhe from './components/MapaDetalhe';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapaList />} />
                <Route path="/mapa/:id" element={<MapaDetalhe />} />
            </Routes>
        </Router>
    );
}

export default App;