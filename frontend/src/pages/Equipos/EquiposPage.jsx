import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as equiposService from '../../services/equipos';
import { equipoSchema } from '../../schemas/equipoSchema';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

function EquipoForm({ defaultValues, onSubmit, enviando }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(equipoSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Nombre</label>
        <input {...register('nombre')} className="w-full rounded-md border px-3 py-2 text-sm" />
        {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral mb-1">Descripción</label>
        <textarea {...register('descripcion')} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
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

function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const cargarEquipos = async () => {
    setCargando(true);
    try {
      const data = await equiposService.listarEquipos({ search: busquedaDebounced });
      setEquipos(data);
    } catch {
      setError('No se pudieron cargar los equipos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busquedaDebounced]);

  const abrirNuevo = () => {
    setEquipoEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (equipo) => {
    setEquipoEditar(equipo);
    setModalAbierto(true);
  };

  const guardar = async (values) => {
    setEnviando(true);
    setError(null);
    try {
      if (equipoEditar) {
        await equiposService.actualizarEquipo(equipoEditar.id, values);
      } else {
        await equiposService.crearEquipo(values);
      }
      setModalAbierto(false);
      await cargarEquipos();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el equipo');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Equipos"
        actions={
          <button
            onClick={abrirNuevo}
            className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark"
          >
            Nuevo equipo
          </button>
        }
      />

      <div className="mb-4 max-w-xs">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre..." />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-neutral border-b">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral">
                    Cargando...
                  </td>
                </tr>
              ) : equipos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral">
                    No hay equipos registrados.
                  </td>
                </tr>
              ) : (
                equipos.map((equipo) => (
                  <tr key={equipo.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{equipo.nombre}</td>
                    <td className="px-4 py-3">{equipo.descripcion || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(equipo)} className="text-primary hover:underline">
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

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title={equipoEditar ? 'Editar equipo' : 'Nuevo equipo'}>
        <EquipoForm
          key={equipoEditar?.id || 'nuevo'}
          defaultValues={equipoEditar || { nombre: '', descripcion: '' }}
          onSubmit={guardar}
          enviando={enviando}
        />
      </Modal>
    </div>
  );
}

export default EquiposPage;
