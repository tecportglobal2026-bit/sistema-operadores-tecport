import api from './api';

export async function listarEquipos({ search } = {}) {
  const { data } = await api.get('/equipos', { params: { search } });
  return data;
}

export async function obtenerEquipo(id) {
  const { data } = await api.get(`/equipos/${id}`);
  return data;
}

export async function crearEquipo(payload) {
  const { data } = await api.post('/equipos', payload);
  return data;
}

export async function actualizarEquipo(id, payload) {
  const { data } = await api.put(`/equipos/${id}`, payload);
  return data;
}
