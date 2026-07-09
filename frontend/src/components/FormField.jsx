import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const LABEL_WIDTH = 152;

const underlineSx = {
  '& .MuiInput-root': { fontSize: '0.875rem' },
  '& .MuiInput-underline:before': { borderBottomColor: 'divider' },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' },
};

const FormField = forwardRef(function FormField({ label, error, helperText, multiline, type, inputProps, sx, ...props }, ref) {
  return (
    <Box sx={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 2 }}>
      <Typography
        sx={{
          width: LABEL_WIDTH,
          flexShrink: 0,
          fontSize: '0.8125rem',
          color: 'text.secondary',
          pt: multiline ? '10px' : 0,
        }}
      >
        {label}
      </Typography>
      <TextField
        inputRef={ref}
        variant="standard"
        fullWidth
        multiline={multiline}
        type={type}
        inputProps={inputProps}
        error={error}
        helperText={helperText}
        sx={{ ...underlineSx, ...sx }}
        {...props}
      />
    </Box>
  );
});

export default FormField;
export { LABEL_WIDTH };
