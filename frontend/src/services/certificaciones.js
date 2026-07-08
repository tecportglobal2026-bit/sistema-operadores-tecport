import api from './api';

export async function listarCertificaciones(params = {}) {
  const { data } = await api.get('/certificaciones', { params });
  return data;
}

export async function obtenerCertificacion(id) {
  const { data } = await api.get(`/certificaciones/${id}`);
  return data;
}

export async function crearCertificacion(payload) {
  const { data } = await api.post('/certificaciones', payload);
  return data;
}

export async function actualizarCertificacion(id, payload) {
  const { data } = await api.put(`/certificaciones/${id}`, payload);
  return data;
}

export async function inactivarCertificacion(id) {
  const { data } = await api.patch(`/certificaciones/${id}/inactivar`);
  return data;
}
