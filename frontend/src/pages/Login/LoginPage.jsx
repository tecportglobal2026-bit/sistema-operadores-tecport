import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useAuth } from '../../hooks/useAuth';
import logoColor from '../../assets/branding/logo-tecport.png';
import fondoLogin from '../../assets/login/fondo-login.webp';

const loginSchema = z.object({
  correo: z.string().trim().email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const inputSx = {
  '& .MuiFilledInput-root': {
    borderRadius: 1,
    bgcolor: '#EEF2FA',
    border: '1.5px solid #D9DEE4',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
    '&:hover': { bgcolor: '#E6ECF7' },
    '&.Mui-focused': {
      bgcolor: '#E6ECF7',
      borderColor: 'primary.main',
    },
  },
  '& .MuiFilledInput-input': {
    paddingTop: '11px',
    paddingBottom: '11px',
  },
};

function LoginPage() {
  const { login, isAuthenticated, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    const destino = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destino} replace />;
  }

  const onSubmit = async (values) => {
    setErrorServidor(null);
    setEnviando(true);
    try {
      await login(values.correo, values.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorServidor(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : error.response?.data?.error || error.message
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 100%), url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 400, p: 5, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box component="img" src={logoColor} alt="TECPORT" sx={{ height: 68, mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" letterSpacing={0.5}>
            INICIAR SESIÓN
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de Gestión de Operadores
          </Typography>
        </Box>

        {(errorServidor || authError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorServidor || authError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Correo electrónico
          </Typography>
          <TextField
            variant="filled"
            hiddenLabel
            type="email"
            fullWidth
            margin="dense"
            InputProps={{ disableUnderline: true }}
            sx={{ ...inputSx, mb: 2 }}
            {...register('correo')}
            error={Boolean(errors.correo)}
            helperText={errors.correo?.message}
          />

          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Contraseña
          </Typography>
          <TextField
            variant="filled"
            hiddenLabel
            type={mostrarPassword ? 'text' : 'password'}
            fullWidth
            margin="dense"
            sx={inputSx}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={enviando}
            sx={{ mt: 3 }}
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
