import { useCallback, useEffect, useState } from 'react';
import * as certificacionesService from '../../services/certificaciones';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { ESTADOS_CERTIFICACION, ESTADO_CERTIFICACION_LABEL } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import CertificacionForm from '../../components/CertificacionForm';
import { formatFecha, formatFechaInput } from '../../utils/format';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const PAGE_SIZE = 10;

function CertificacionesPage() {
  const [operadores, setOperadores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda);
  const [empresaId, setEmpresaId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [certificacionEditar, setCertificacionEditar] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    operadoresService
      .listarOperadores({ pageSize: 1000 })
      .then((res) => setOperadores(res.data))
      .catch(() => {});
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [busquedaDebounced, empresaId, equipoId, estado]);

  const cargarCertificaciones = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await certificacionesService.listarCertificaciones({
        search: busquedaDebounced || undefined,
        empresaId: empresaId || undefined,
        equipoId: equipoId || undefined,
        estado: estado || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setResultado(data);
    } catch {
      setError('No se pudieron cargar las certificaciones');
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, empresaId, equipoId, estado, page]);

  useEffect(() => {
    cargarCertificaciones();
  }, [cargarCertificaciones]);

  const abrirNueva = () => {
    setCertificacionEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cert) => {
    setCertificacionEditar(cert);
    setModalAbierto(true);
  };

  const guardar = async (values) => {
    setEnviando(true);
    setError(null);
    try {
      if (certificacionEditar) {
        await certificacionesService.actualizarCertificacion(certificacionEditar.id, values);
      } else {
        await certificacionesService.crearCertificacion(values);
      }
      setModalAbierto(false);
      await cargarCertificaciones();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la certificación');
    } finally {
      setEnviando(false);
    }
  };

  const handleInactivar = async (cert) => {
    if (!window.confirm(`¿Marcar como inactiva la certificación "${cert.nombreCertificacion}"?`)) return;
    try {
      await certificacionesService.inactivarCertificacion(cert.id);
      await cargarCertificaciones();
    } catch {
      setError('No se pudo inactivar la certificación');
    }
  };

  return (
    <div>
      <PageHeader
        title="Certificaciones"
        actions={
          <button
            onClick={abrirNueva}
            className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark"
          >
            Nueva certificación
          </button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Operador, DNI o certificación..." />

          <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todos los equipos</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre}
              </option>
            ))}
          </select>

          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todos los estados</option>
            {ESTADOS_CERTIFICACION.map((est) => (
              <option key={est} value={est}>
                {ESTADO_CERTIFICACION_LABEL[est]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-neutral border-b">
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Certificación</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-neutral">
                    Cargando...
                  </td>
                </tr>
              ) : resultado.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-neutral">
                    No se encontraron certificaciones.
                  </td>
                </tr>
              ) : (
                resultado.data.map((cert) => (
                  <tr key={cert.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{cert.operador?.nombreCompleto}</td>
                    <td className="px-4 py-3">{cert.operador?.empresa?.nombre}</td>
                    <td className="px-4 py-3">{cert.equipo?.nombre}</td>
                    <td className="px-4 py-3">{cert.nombreCertificacion}</td>
                    <td className="px-4 py-3">{formatFecha(cert.fechaVencimiento)}</td>
                    <td className="px-4 py-3">
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </td>
                    <td className="px-4 py-3">
                      {cert.archivoUrl ? (
                        <a href={cert.archivoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          Ver
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      <button onClick={() => abrirEditar(cert)} className="text-primary hover:underline">
                        Editar
                      </button>
                      {cert.estado !== 'inactivo' && (
                        <button onClick={() => handleInactivar(cert)} className="text-red-600 hover:underline">
                          Inactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} pageSize={PAGE_SIZE} total={resultado.total} onPageChange={setPage} />

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={certificacionEditar ? 'Editar certificación' : 'Nueva certificación'}
      >
        <CertificacionForm
          key={certificacionEditar?.id || 'nueva'}
          equipos={equipos}
          operadores={operadores}
          defaultValues={
            certificacionEditar
              ? {
                  operadorId: certificacionEditar.operadorId,
                  equipoId: certificacionEditar.equipoId,
                  nombreCertificacion: certificacionEditar.nombreCertificacion,
                  entidadEmisora: certificacionEditar.entidadEmisora,
                  fechaEmision: formatFechaInput(certificacionEditar.fechaEmision),
                  fechaVencimiento: formatFechaInput(certificacionEditar.fechaVencimiento),
                  archivoUrl: certificacionEditar.archivoUrl || '',
                  observaciones: certificacionEditar.observaciones || '',
                }
              : {
                  operadorId: '',
                  equipoId: '',
                  nombreCertificacion: '',
                  entidadEmisora: '',
                  fechaEmision: '',
                  fechaVencimiento: '',
                  archivoUrl: '',
                  observaciones: '',
                }
          }
          onSubmit={guardar}
          enviando={enviando}
        />
      </Modal>
    </div>
  );
}

export default CertificacionesPage;
