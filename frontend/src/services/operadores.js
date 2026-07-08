import api from './api';

export async function listarOperadores(params = {}) {
  const { data } = await api.get('/operadores', { params });
  return data;
}

export async function obtenerOperador(id) {
  const { data } = await api.get(`/operadores/${id}`);
  return data;
}

export async function crearOperador(payload) {
  const { data } = await api.post('/operadores', payload);
  return data;
}

export async function actualizarOperador(id, payload) {
  const { data } = await api.put(`/operadores/${id}`, payload);
  return data;
}

export async function desactivarOperador(id, motivoInactivo) {
  const { data } = await api.patch(`/operadores/${id}/desactivar`, { motivoInactivo });
  return data;
}

export async function reactivarOperador(id) {
  const { data } = await api.patch(`/operadores/${id}/reactivar`);
  return data;
}
