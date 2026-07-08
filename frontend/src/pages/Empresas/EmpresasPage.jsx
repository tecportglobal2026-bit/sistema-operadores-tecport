import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as empresasService from '../../services/empresas';
import { empresaSchema } from '../../schemas/empresaSchema';
import { TIPOS_EMPRESA, REGIONES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

function EmpresaForm({ defaultValues, onSubmit, enviando }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(empresaSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Nombre</label>
        <input {...register('nombre')} className="w-full rounded-md border px-3 py-2 text-sm" />
        {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">RUC</label>
        <input {...register('ruc')} className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Tipo de empresa</label>
        <select {...register('tipoEmpresa')} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Selecciona...</option>
          {TIPOS_EMPRESA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        {errors.tipoEmpresa && <p className="text-xs text-red-600 mt-1">{errors.tipoEmpresa.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Región</label>
        <select {...register('region')} className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Selecciona...</option>
          {REGIONES.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region.message}</p>}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-primary text-white py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
      >
        {enviando ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}

function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaEditar, setEmpresaEditar] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const cargarEmpresas = async () => {
    setCargando(true);
    try {
      const data = await empresasService.listarEmpresas({ search: busquedaDebounced });
      setEmpresas(data);
    } catch {
      setError('No se pudieron cargar las empresas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busquedaDebounced]);

  const abrirNueva = () => {
    setEmpresaEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (empresa) => {
    setEmpresaEditar(empresa);
    setModalAbierto(true);
  };

  const guardar = async (values) => {
    setEnviando(true);
    setError(null);
    try {
      if (empresaEditar) {
        await empresasService.actualizarEmpresa(empresaEditar.id, values);
      } else {
        await empresasService.crearEmpresa(values);
      }
      setModalAbierto(false);
      await cargarEmpresas();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la empresa');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Empresas"
        actions={
          <button
            onClick={abrirNueva}
            className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark"
          >
            Nueva empresa
          </button>
        }
      />

      <div className="mb-4 max-w-xs">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o RUC..." />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-neutral border-b">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">RUC</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Región</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral">
                    Cargando...
                  </td>
                </tr>
              ) : empresas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral">
                    No hay empresas registradas.
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{empresa.nombre}</td>
                    <td className="px-4 py-3">{empresa.ruc || '—'}</td>
                    <td className="px-4 py-3">{empresa.tipoEmpresa}</td>
                    <td className="px-4 py-3">{empresa.region}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(empresa)} className="text-primary hover:underline">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={empresaEditar ? 'Editar empresa' : 'Nueva empresa'}
      >
        <EmpresaForm
          key={empresaEditar?.id || 'nueva'}
          defaultValues={empresaEditar || { nombre: '', ruc: '', tipoEmpresa: '', region: '' }}
          onSubmit={guardar}
          enviando={enviando}
        />
      </Modal>
    </div>
  );
}

export default EmpresasPage;
