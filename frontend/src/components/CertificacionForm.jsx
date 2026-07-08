import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { certificacionSchema } from '../schemas/certificacionSchema';

function CertificacionForm({ equipos, operadores = [], defaultValues, onSubmit, enviando, mostrarOperador = true }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(certificacionSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {mostrarOperador ? (
        <div>
          <label className="block text-sm font-medium text-neutral mb-1">Operador</label>
          <select {...register('operadorId')} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Selecciona...</option>
            {operadores.map((op) => (
              <option key={op.id} value={op.id}>
                {op.nombreCompleto} ({op.dni})
              </option>
            ))}
          </select>
          {errors.operadorId && <p className="text-xs text-red-600 mt-1">{errors.operadorId.message}</p>}
        </div>
      ) : (
        <input type="hidden" {...register('operadorId')} />
      )}

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Equipo</label>
        <select {...register('equipoId')} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Selecciona...</option>
          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
        {errors.equipoId && <p className="text-xs text-red-600 mt-1">{errors.equipoId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Nombre de certificación</label>
        <input {...register('nombreCertificacion')} className="w-full rounded-md border px-3 py-2 text-sm" />
        {errors.nombreCertificacion && <p className="text-xs text-red-600 mt-1">{errors.nombreCertificacion.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Entidad emisora</label>
        <input {...register('entidadEmisora')} className="w-full rounded-md border px-3 py-2 text-sm" />
        {errors.entidadEmisora && <p className="text-xs text-red-600 mt-1">{errors.entidadEmisora.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral mb-1">Fecha de emisión</label>
          <input type="date" {...register('fechaEmision')} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral mb-1">Fecha de vencimiento</label>
          <input type="date" {...register('fechaVencimiento')} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.fechaVencimiento && <p className="text-xs text-red-600 mt-1">{errors.fechaVencimiento.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Archivo (URL evidencia)</label>
        <input {...register('archivoUrl')} placeholder="https://..." className="w-full rounded-md border px-3 py-2 text-sm" />
        {errors.archivoUrl && <p className="text-xs text-red-600 mt-1">{errors.archivoUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Observaciones</label>
        <textarea {...register('observaciones')} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-primary text-white py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
      >
        {enviando ? 'Guardando...' : 'Guardar certificación'}
      </button>
    </form>
  );
}

export default CertificacionForm;
