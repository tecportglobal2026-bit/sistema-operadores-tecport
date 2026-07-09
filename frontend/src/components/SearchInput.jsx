import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

function SearchInput({ value, onChange, placeholder = 'Buscar...', size = 'small', fullWidth }) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}

export default SearchInput;
