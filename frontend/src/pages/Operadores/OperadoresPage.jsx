import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { REGIONES, ESTADOS_CERTIFICACION, ESTADO_CERTIFICACION_LABEL } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import EstadoOperadorBadge from '../../components/EstadoOperadorBadge';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const PAGE_SIZE = 10;

function OperadoresPage() {
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda);
  const [region, setRegion] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [activo, setActivo] = useState('');
  const [estadoCertificacion, setEstadoCertificacion] = useState('');
  const [page, setPage] = useState(1);

  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [operadorDesactivar, setOperadorDesactivar] = useState(null);
  const [motivoInactivo, setMotivoInactivo] = useState('');
  const [accionEnCurso, setAccionEnCurso] = useState(false);

  useEffect(() => {
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [busquedaDebounced, region, empresaId, equipoId, activo, estadoCertificacion]);

  const cargarOperadores = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await operadoresService.listarOperadores({
        search: busquedaDebounced || undefined,
        region: region || undefined,
        empresaId: empresaId || undefined,
        equipoId: equipoId || undefined,
        activo: activo || undefined,
        estadoCertificacion: estadoCertificacion || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setResultado(data);
    } catch {
      setError('No se pudieron cargar los operadores');
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, region, empresaId, equipoId, activo, estadoCertificacion, page]);

  useEffect(() => {
    cargarOperadores();
  }, [cargarOperadores]);

  const abrirDesactivar = (operador) => {
    setOperadorDesactivar(operador);
    setMotivoInactivo('');
  };

  const confirmarDesactivar = async () => {
    if (!motivoInactivo.trim()) return;
    setAccionEnCurso(true);
    try {
      await operadoresService.desactivarOperador(operadorDesactivar.id, motivoInactivo.trim());
      setOperadorDesactivar(null);
      await cargarOperadores();
    } catch {
      setError('No se pudo desactivar al operador');
    } finally {
      setAccionEnCurso(false);
    }
  };

  const handleReactivar = async (operador) => {
    if (!window.confirm(`¿Reactivar a ${operador.nombreCompleto}?`)) return;
    setAccionEnCurso(true);
    try {
      await operadoresService.reactivarOperador(operador.id);
      await cargarOperadores();
    } catch {
      setError('No se pudo reactivar al operador');
    } finally {
      setAccionEnCurso(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Operadores"
        actions={
          <Link
            to="/operadores/nuevo"
            className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark"
          >
            Nuevo operador
          </Link>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Nombre, DNI o empresa..." />

          <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todas las regiones</option>
            {REGIONES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

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

          <select value={activo} onChange={(e) => setActivo(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <select
            value={estadoCertificacion}
            onChange={(e) => setEstadoCertificacion(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Cualquier certificación</option>
            {ESTADOS_CERTIFICACION.map((estado) => (
              <option key={estado} value={estado}>
                {ESTADO_CERTIFICACION_LABEL[estado]}
              </option>
            ))}
            <option value="sin_certificacion">Sin certificación</option>
          </select>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-neutral border-b">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Región</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Certificación</th>
                <th className="px-4 py-3">Estado cert.</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-neutral">
                    Cargando...
                  </td>
                </tr>
              ) : resultado.data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-neutral">
                    No se encontraron operadores.
                  </td>
                </tr>
              ) : (
                resultado.data.map((op) => (
                  <tr key={op.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">
                      <Link to={`/operadores/${op.id}`} className="hover:underline">
                        {op.nombreCompleto}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{op.dni}</td>
                    <td className="px-4 py-3">{op.empresa?.nombre}</td>
                    <td className="px-4 py-3">{op.region}</td>
                    <td className="px-4 py-3">{op.nivel}</td>
                    <td className="px-4 py-3">{op.certificacionPrincipal?.nombreCertificacion || '—'}</td>
                    <td className="px-4 py-3">
                      {op.certificacionPrincipal ? (
                        <EstadoCertificacionBadge estado={op.certificacionPrincipal.estado} />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoOperadorBadge activo={op.activo} />
                    </td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      <Link to={`/operadores/${op.id}/editar`} className="text-primary hover:underline">
                        Editar
                      </Link>
                      {op.activo ? (
                        <button onClick={() => abrirDesactivar(op)} className="text-red-600 hover:underline">
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivar(op)}
                          disabled={accionEnCurso}
                          className="text-green-700 hover:underline disabled:opacity-60"
                        >
                          Reactivar
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

      <Modal open={Boolean(operadorDesactivar)} onClose={() => setOperadorDesactivar(null)} title="Desactivar operador">
        <p className="text-sm text-neutral mb-3">
          Vas a desactivar a <strong>{operadorDesactivar?.nombreCompleto}</strong>. Indica el motivo:
        </p>
        <textarea
          value={motivoInactivo}
          onChange={(e) => setMotivoInactivo(e.target.value)}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm mb-4"
          placeholder="Motivo de inactivación"
        />
        <button
          onClick={confirmarDesactivar}
          disabled={accionEnCurso || !motivoInactivo.trim()}
          className="w-full rounded-md bg-red-600 text-white py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60"
        >
          {accionEnCurso ? 'Procesando...' : 'Confirmar desactivación'}
        </button>
      </Modal>
    </div>
  );
}

export default OperadoresPage;
