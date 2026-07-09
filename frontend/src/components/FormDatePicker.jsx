import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LABEL_WIDTH } from './FormField';

const underlineSx = {
  '& .MuiInput-root': { fontSize: '0.875rem' },
  '& .MuiInput-underline:before': { borderBottomColor: 'divider' },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' },
};

function FormDatePicker({ label, name, control, error, helperText, sx, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ width: LABEL_WIDTH, flexShrink: 0, fontSize: '0.8125rem', color: 'text.secondary' }}>
            {label}
          </Typography>
          <DatePicker
            {...field}
            value={value ? dayjs(value) : null}
            onChange={(newValue) => onChange(newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '')}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                variant: 'standard',
                fullWidth: true,
                error,
                helperText,
                sx: { ...underlineSx, ...sx },
              },
            }}
            {...props}
          />
        </Box>
      )}
    />
  );
}

export default FormDatePicker;
