import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Card from './Card';

const COLOR_MAP = {
  default: 'primary.main',
  warning: 'secondary.main',
  danger: 'error.main',
};

function StatCard({ label, value, variant = 'default', icon }) {
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: COLOR_MAP[variant], mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
        {icon && (
          <Avatar sx={{ bgcolor: 'action.hover', color: COLOR_MAP[variant], width: 44, height: 44 }}>{icon}</Avatar>
        )}
      </Box>
    </Card>
  );
}

export default StatCard;
