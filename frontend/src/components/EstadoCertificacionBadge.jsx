import Chip from '@mui/material/Chip';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

const CONFIG = {
  vigente: { color: 'success', label: 'Vigente', icon: <CheckCircleRoundedIcon /> },
  por_vencer: { color: 'warning', label: 'Por vencer', icon: <WarningRoundedIcon /> },
  vencido: { color: 'error', label: 'Vencido', icon: <CancelRoundedIcon /> },
  inactivo: { color: 'default', label: 'Inactivo', icon: <BlockRoundedIcon /> },
};

function EstadoCertificacionBadge({ estado }) {
  const config = CONFIG[estado] || CONFIG.inactivo;
  return <Chip size="small" color={config.color} variant="outlined" icon={config.icon} label={config.label} />;
}

export default EstadoCertificacionBadge;
