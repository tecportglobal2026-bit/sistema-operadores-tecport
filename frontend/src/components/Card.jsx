import Paper from '@mui/material/Paper';

function Card({ children, sx = {} }) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 1.5, ...sx }}>
      {children}
    </Paper>
  );
}

export default Card;
