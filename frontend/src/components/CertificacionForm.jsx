import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { certificacionSchema } from '../schemas/certificacionSchema';
import FormField from './FormField';
import FormAutocomplete from './FormAutocomplete';
import ModalFormActions from './ModalFormActions';

function CertificacionForm({ equipos, operadores = [], defaultValues, onSubmit, onCancel, enviando, mostrarOperador = true }) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(certificacionSchema), defaultValues });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container rowSpacing={2} columnSpacing={2}>
        {mostrarOperador ? (
          <Grid item xs={12}>
            <Controller
              name="operadorId"
              control={control}
              render={({ field }) => (
                <FormAutocomplete
                  label="Operador"
                  options={operadores}
                  getOptionLabel={(op) => `${op.nombreCompleto} (${op.dni})`}
                  isOptionEqualToValue={(op, val) => op.id === val.id}
                  value={operadores.find((op) => op.id === field.value) || null}
                  onChange={(_, value) => field.onChange(value?.id || '')}
                  error={Boolean(errors.operadorId)}
                  helperText={errors.operadorId?.message}
                />
              )}
            />
          </Grid>
        ) : (
          <input type="hidden" {...register('operadorId')} />
        )}

        <Grid item xs={12}>
          <Controller
            name="equipoId"
            control={control}
            render={({ field }) => (
              <FormAutocomplete
                label="Equipo"
                options={equipos}
                getOptionLabel={(eq) => eq.nombre}
                isOptionEqualToValue={(eq, val) => eq.id === val.id}
                value={equipos.find((eq) => eq.id === field.value) || null}
                onChange={(_, value) => field.onChange(value?.id || '')}
                error={Boolean(errors.equipoId)}
                helperText={errors.equipoId?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Nombre de certificación"
            {...register('nombreCertificacion')}
            error={Boolean(errors.nombreCertificacion)}
            helperText={errors.nombreCertificacion?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Entidad emisora"
            {...register('entidadEmisora')}
            error={Boolean(errors.entidadEmisora)}
            helperText={errors.entidadEmisora?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField label="Fecha de emisión" type="date" InputLabelProps={{ shrink: true }} {...register('fechaEmision')} />
        </Grid>
        <Grid item xs={12}>
          <FormField
            label="Fecha de vencimiento"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('fechaVencimiento')}
            error={Boolean(errors.fechaVencimiento)}
            helperText={errors.fechaVencimiento?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            label="Archivo (URL evidencia)"
            placeholder="https://..."
            {...register('archivoUrl')}
            error={Boolean(errors.archivoUrl)}
            helperText={errors.archivoUrl?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField label="Observaciones" multiline rows={2} {...register('observaciones')} />
        </Grid>
      </Grid>
      <ModalFormActions onCancel={onCancel} enviando={enviando} label="Guardar certificación" />
    </Box>
  );
}

export default CertificacionForm;
