import api from './api';

export async function listarEmpresas({ search } = {}) {
  const { data } = await api.get('/empresas', { params: { search } });
  return data;
}

export async function obtenerEmpresa(id) {
  const { data } = await api.get(`/empresas/${id}`);
  return data;
}

export async function crearEmpresa(payload) {
  const { data } = await api.post('/empresas', payload);
  return data;
}

export async function actualizarEmpresa(id, payload) {
  const { data } = await api.put(`/empresas/${id}`, payload);
  return data;
}
