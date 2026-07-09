import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { LABEL_WIDTH } from './FormField';

const underlineSx = {
  '& .MuiInput-root': { fontSize: '0.875rem' },
  '& .MuiInput-underline:before': { borderBottomColor: 'divider' },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' },
};

function FormAutocomplete({ label, error, helperText, ...autocompleteProps }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography sx={{ width: LABEL_WIDTH, flexShrink: 0, fontSize: '0.8125rem', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Autocomplete
        size="small"
        fullWidth
        {...autocompleteProps}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            error={error}
            helperText={helperText}
            sx={underlineSx}
          />
        )}
      />
    </Box>
  );
}

export default FormAutocomplete;
