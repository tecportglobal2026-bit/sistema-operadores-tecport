import SvgIcon from '@mui/material/SvgIcon';

function CraneIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* pluma / contrapluma (brazo horizontal superior) */}
      <rect x="2" y="3" width="20" height="1.8" rx="0.3" />
      {/* contrapeso en el extremo izquierdo */}
      <rect x="2" y="4.9" width="2.8" height="2.8" rx="0.3" />
      {/* mástil vertical */}
      <rect x="9.4" y="3" width="1.9" height="18" rx="0.3" />
      {/* tirante diagonal (el rasgo distintivo de una grúa torre) */}
      <rect x="9.6" y="7.3" width="11.5" height="1.5" rx="0.3" transform="rotate(-13 9.6 7.3)" />
      {/* cable del gancho */}
      <rect x="18.7" y="4.8" width="0.7" height="6.2" />
      {/* gancho */}
      <rect x="17.9" y="11" width="2.3" height="1.4" rx="0.3" />
      {/* base */}
      <polygon points="6,22 9.6,20.8 12.4,20.8 16,22" />
    </SvgIcon>
  );
}

export default CraneIcon;
