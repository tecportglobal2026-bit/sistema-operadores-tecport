import Chip from '@mui/material/Chip';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';

function EstadoOperadorBadge({ activo }) {
  return activo ? (
    <Chip size="small" color="success" variant="outlined" icon={<CheckCircleRoundedIcon />} label="Activo" />
  ) : (
    <Chip size="small" color="default" variant="outlined" icon={<RemoveCircleRoundedIcon />} label="Inactivo" />
  );
}

export default EstadoOperadorBadge;
