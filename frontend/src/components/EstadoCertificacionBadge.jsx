import Badge from './Badge';

const CONFIG = {
  vigente: { variant: 'verde', label: 'Vigente' },
  por_vencer: { variant: 'naranja', label: 'Por vencer' },
  vencido: { variant: 'rojo', label: 'Vencido' },
  inactivo: { variant: 'gris', label: 'Inactivo' },
};

function EstadoCertificacionBadge({ estado }) {
  const config = CONFIG[estado] || CONFIG.inactivo;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default EstadoCertificacionBadge;
