import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

function ModalFormActions({ onCancel, enviando, label = 'Guardar', savingLabel = 'Guardando...' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5 }}>
      <Button variant="outlined" color="inherit" onClick={onCancel} disabled={enviando}>
        Cancelar
      </Button>
      <Button type="submit" variant="contained" disabled={enviando}>
        {enviando ? savingLabel : label}
      </Button>
    </Box>
  );
}

export default ModalFormActions;
