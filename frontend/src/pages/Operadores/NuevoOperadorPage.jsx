import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { operadorCrearSchema } from '../../schemas/operadorSchema';
import { REGIONES, NIVELES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

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
    <div>
      <PageHeader title="Nuevo operador" />

      {errorServidor && <p className="text-sm text-red-600 mb-4">{errorServidor}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-primary mb-4">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Nombre completo</label>
              <input {...register('nombreCompleto')} className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.nombreCompleto && <p className="text-xs text-red-600 mt-1">{errors.nombreCompleto.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">DNI</label>
              <input {...register('dni')} maxLength={8} className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.dni && <p className="text-xs text-red-600 mt-1">{errors.dni.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Fecha de nacimiento</label>
              <input type="date" {...register('fechaNacimiento')} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Celular</label>
              <input {...register('celular')} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Correo</label>
              <input {...register('correo')} className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">LinkedIn</label>
              <input {...register('linkedin')} className="w-full rounded-md border px-3 py-2 text-sm" />
              {errors.linkedin && <p className="text-xs text-red-600 mt-1">{errors.linkedin.message}</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-primary mb-4">Datos laborales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Región</label>
              <select {...register('region')} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Selecciona...</option>
                {REGIONES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Empresa</label>
              <select {...register('empresaId')} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Selecciona...</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresaId && <p className="text-xs text-red-600 mt-1">{errors.empresaId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">Nivel</label>
              <select {...register('nivel')} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Selecciona...</option>
                {NIVELES.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
              {errors.nivel && <p className="text-xs text-red-600 mt-1">{errors.nivel.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral mb-1">Observaciones</label>
            <textarea {...register('observaciones')} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </Card>

        <Card className="p-6">
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" {...register('tieneCertificacion')} className="rounded border" />
            <span className="text-sm font-semibold text-primary">Registrar certificación inicial</span>
          </label>

          {tieneCertificacion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Equipo</label>
                <select {...register('certificacion.equipoId')} className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">Selecciona...</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.certificacion?.equipoId && (
                  <p className="text-xs text-red-600 mt-1">{errors.certificacion.equipoId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Nombre de certificación</label>
                <input {...register('certificacion.nombreCertificacion')} className="w-full rounded-md border px-3 py-2 text-sm" />
                {errors.certificacion?.nombreCertificacion && (
                  <p className="text-xs text-red-600 mt-1">{errors.certificacion.nombreCertificacion.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Entidad emisora</label>
                <input {...register('certificacion.entidadEmisora')} className="w-full rounded-md border px-3 py-2 text-sm" />
                {errors.certificacion?.entidadEmisora && (
                  <p className="text-xs text-red-600 mt-1">{errors.certificacion.entidadEmisora.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Fecha de emisión</label>
                <input type="date" {...register('certificacion.fechaEmision')} className="w-full rounded-md border px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Fecha de vencimiento</label>
                <input type="date" {...register('certificacion.fechaVencimiento')} className="w-full rounded-md border px-3 py-2 text-sm" />
                {errors.certificacion?.fechaVencimiento && (
                  <p className="text-xs text-red-600 mt-1">{errors.certificacion.fechaVencimiento.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral mb-1">Archivo (URL evidencia)</label>
                <input {...register('certificacion.archivoUrl')} className="w-full rounded-md border px-3 py-2 text-sm" />
                {errors.certificacion?.archivoUrl && (
                  <p className="text-xs text-red-600 mt-1">{errors.certificacion.archivoUrl.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral mb-1">Observaciones</label>
                <textarea {...register('certificacion.observaciones')} rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
              </div>
            </div>
          )}
        </Card>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary text-white px-6 py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Crear operador'}
        </button>
      </form>
    </div>
  );
}

export default NuevoOperadorPage;
