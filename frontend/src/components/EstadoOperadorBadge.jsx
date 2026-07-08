import Badge from './Badge';

function EstadoOperadorBadge({ activo }) {
  return activo ? <Badge variant="verde">Activo</Badge> : <Badge variant="gris">Inactivo</Badge>;
}

export default EstadoOperadorBadge;
