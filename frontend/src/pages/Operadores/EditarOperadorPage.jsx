import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import { operadorEditSchema } from '../../schemas/operadorSchema';
import { REGIONES, NIVELES } from '../../utils/constants';
import { formatFechaInput } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import FormField from '../../components/FormField';
import FormDatePicker from '../../components/FormDatePicker';
import FormAutocomplete from '../../components/FormAutocomplete';

function SeccionTitulo({ children }) {
  return (
    <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

function EditarOperadorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorServidor, setErrorServidor] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(operadorEditSchema) });

  useEffect(() => {
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    operadoresService
      .obtenerOperador(id)
      .then((operador) => {
        reset({
          nombreCompleto: operador.nombreCompleto,
          dni: operador.dni,
          fechaNacimiento: formatFechaInput(operador.fechaNacimiento),
          celular: operador.celular || '',
          correo: operador.correo || '',
          linkedin: operador.linkedin || '',
          region: operador.region,
          empresaId: operador.empresaId,
          nivel: operador.nivel,
          observaciones: operador.observaciones || '',
        });
      })
      .catch(() => setErrorServidor('No se pudo cargar el operador'))
      .finally(() => setCargando(false));
  }, [id, reset]);

  const onSubmit = async (values) => {
    setErrorServidor(null);
    try {
      await operadoresService.actualizarOperador(id, values);
      navigate(`/operadores/${id}`);
    } catch (error) {
      setErrorServidor(error.response?.data?.error || 'No se pudo actualizar el operador');
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <PageHeader title="Editar operador" />

      {errorServidor && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorServidor}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card sx={{ p: 4 }}>
          <SeccionTitulo>Datos personales</SeccionTitulo>
          <Grid container rowSpacing={2.5} columnSpacing={4}>
            <Grid item xs={12} md={6}>
              <FormField
                label="Nombre completo"
                {...register('nombreCompleto')}
                error={Boolean(errors.nombreCompleto)}
                helperText={errors.nombreCompleto?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="DNI"
                inputProps={{ maxLength: 8 }}
                {...register('dni')}
                error={Boolean(errors.dni)}
                helperText={errors.dni?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormDatePicker label="Fecha de nacimiento" name="fechaNacimiento" control={control} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField label="Celular" {...register('celular')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="Correo"
                {...register('correo')}
                error={Boolean(errors.correo)}
                helperText={errors.correo?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                label="LinkedIn"
                {...register('linkedin')}
                error={Boolean(errors.linkedin)}
                helperText={errors.linkedin?.message}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3.5 }} />

          <SeccionTitulo>Datos laborales</SeccionTitulo>
          <Grid container rowSpacing={2.5} columnSpacing={4}>
            <Grid item xs={12} md={6}>
              <FormField
                select
                label="Región"
                {...register('region')}
                error={Boolean(errors.region)}
                helperText={errors.region?.message}
              >
                {REGIONES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="empresaId"
                control={control}
                render={({ field }) => (
                  <FormAutocomplete
                    label="Empresa"
                    options={empresas}
                    getOptionLabel={(op) => op.nombre || ''}
                    isOptionEqualToValue={(op, val) => op.id === val.id}
                    value={empresas.find((e) => e.id === field.value) || null}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    error={Boolean(errors.empresaId)}
                    helperText={errors.empresaId?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField
                select
                label="Nivel"
                {...register('nivel')}
                error={Boolean(errors.nivel)}
                helperText={errors.nivel?.message}
              >
                {NIVELES.map((nivel) => (
                  <MenuItem key={nivel} value={nivel}>
                    {nivel}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid item xs={12}>
              <FormField label="Observaciones" multiline rows={2} {...register('observaciones')} />
            </Grid>
          </Grid>
        </Card>

        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 3 }}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  );
}

export default EditarOperadorPage;
