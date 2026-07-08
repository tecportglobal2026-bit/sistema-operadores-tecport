import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import { operadorEditSchema } from '../../schemas/operadorSchema';
import { REGIONES, NIVELES } from '../../utils/constants';
import { formatFechaInput } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

function EditarOperadorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorServidor, setErrorServidor] = useState(null);

  const {
    register,
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

  if (cargando) return <p className="text-sm text-neutral">Cargando...</p>;

  return (
    <div>
      <PageHeader title="Editar operador" />

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary text-white px-6 py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

export default EditarOperadorPage;
