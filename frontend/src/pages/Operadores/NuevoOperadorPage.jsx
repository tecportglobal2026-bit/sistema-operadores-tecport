import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { operadorCrearSchema } from '../../schemas/operadorSchema';
import { REGIONES, NIVELES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import FormField from '../../components/FormField';
import FormAutocomplete from '../../components/FormAutocomplete';

function SeccionTitulo({ children }) {
  return (
    <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

function NuevoOperadorPage() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [errorServidor, setErrorServidor] = useState(null);

  useEffect(() => {
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(operadorCrearSchema),
    defaultValues: { tieneCertificacion: false },
  });

  const tieneCertificacion = watch('tieneCertificacion');

  const onSubmit = async (values) => {
    setErrorServidor(null);
    const payload = { ...values };
    if (!payload.tieneCertificacion) {
      delete payload.certificacion;
    }
    try {
      const operador = await operadoresService.crearOperador(payload);
      navigate(`/operadores/${operador.id}`);
    } catch (error) {
      setErrorServidor(error.response?.data?.error || 'No se pudo crear el operador');
    }
  };

  return (
    <Box sx={{ maxWidth: 860 }}>
      <PageHeader title="Nuevo operador" />

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
              <FormField label="Fecha de nacimiento" type="date" InputLabelProps={{ shrink: true }} {...register('fechaNacimiento')} />
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
                defaultValue=""
                {...register('region')}
                error={Boolean(errors.region)}
                helperText={errors.region?.message}
              >
                <MenuItem value="">Selecciona...</MenuItem>
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
                defaultValue=""
                {...register('nivel')}
                error={Boolean(errors.nivel)}
                helperText={errors.nivel?.message}
              >
                <MenuItem value="">Selecciona...</MenuItem>
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

          <Divider sx={{ my: 3.5 }} />

          <FormControlLabel
            control={<Checkbox size="small" {...register('tieneCertificacion')} />}
            label={
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Registrar certificación inicial
              </Typography>
            }
            sx={{ mb: tieneCertificacion ? 2.5 : 0 }}
          />

          <Collapse in={tieneCertificacion} unmountOnExit>
            <Grid container rowSpacing={2.5} columnSpacing={4}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="certificacion.equipoId"
                  control={control}
                  render={({ field }) => (
                    <FormAutocomplete
                      label="Equipo"
                      options={equipos}
                      getOptionLabel={(eq) => eq.nombre || ''}
                      isOptionEqualToValue={(eq, val) => eq.id === val.id}
                      value={equipos.find((eq) => eq.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id || '')}
                      error={Boolean(errors.certificacion?.equipoId)}
                      helperText={errors.certificacion?.equipoId?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField
                  label="Nombre de certificación"
                  {...register('certificacion.nombreCertificacion')}
                  error={Boolean(errors.certificacion?.nombreCertificacion)}
                  helperText={errors.certificacion?.nombreCertificacion?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField
                  label="Entidad emisora"
                  {...register('certificacion.entidadEmisora')}
                  error={Boolean(errors.certificacion?.entidadEmisora)}
                  helperText={errors.certificacion?.entidadEmisora?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField
                  label="Fecha de emisión"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('certificacion.fechaEmision')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField
                  label="Fecha de vencimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('certificacion.fechaVencimiento')}
                  error={Boolean(errors.certificacion?.fechaVencimiento)}
                  helperText={errors.certificacion?.fechaVencimiento?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormField
                  label="Archivo (URL evidencia)"
                  {...register('certificacion.archivoUrl')}
                  error={Boolean(errors.certificacion?.archivoUrl)}
                  helperText={errors.certificacion?.archivoUrl?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <FormField label="Observaciones" {...register('certificacion.observaciones')} />
              </Grid>
            </Grid>
          </Collapse>
        </Card>

        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 3 }}>
          {isSubmitting ? 'Guardando...' : 'Crear operador'}
        </Button>
      </Box>
    </Box>
  );
}

export default NuevoOperadorPage;
