import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
});

// Funções para mapas
export const mapasAPI = {
    getAll: () => api.get('/mapas'),
    create: (nome) => api.post('/mapas', { nome }),
    getPontos: (mapaId) => api.get(`/mapas/${mapaId}/pontos`),
    createPonto: (mapaId, ponto) => api.post(`/mapas/${mapaId}/pontos`, ponto),
    updatePonto: (pontoId, nome) => api.put(`/pontos/${pontoId}`, { nome }),
    deletePonto: (pontoId) => api.delete(`/pontos/${pontoId}`),
    deleteAllPontos: (mapaId) => api.delete(`/mapas/${mapaId}/pontos`),
    checkHealth: () => api.get('/health'),
};

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        console.error('Erro na requisição:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;