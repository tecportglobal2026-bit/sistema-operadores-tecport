import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as operadoresService from '../../services/operadores';
import * as equiposService from '../../services/equipos';
import * as certificacionesService from '../../services/certificaciones';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import EstadoOperadorBadge from '../../components/EstadoOperadorBadge';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import CertificacionForm from '../../components/CertificacionForm';
import { formatFecha, calcularEdad } from '../../utils/format';

function OperadorDetallePage() {
  const { id } = useParams();
  const [operador, setOperador] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalCertAbierto, setModalCertAbierto] = useState(false);
  const [enviandoCert, setEnviandoCert] = useState(false);

  const [modalDesactivar, setModalDesactivar] = useState(false);
  const [motivoInactivo, setMotivoInactivo] = useState('');
  const [accionEnCurso, setAccionEnCurso] = useState(false);

  const cargarOperador = useCallback(async () => {
    setCargando(true);
    try {
      const data = await operadoresService.obtenerOperador(id);
      setOperador(data);
      setError(null);
    } catch {
      setError('No se pudo cargar el operador');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarOperador();
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, [cargarOperador]);

  const handleAgregarCertificacion = async (values) => {
    setEnviandoCert(true);
    try {
      await certificacionesService.crearCertificacion({ ...values, operadorId: id });
      setModalCertAbierto(false);
      await cargarOperador();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la certificación');
    } finally {
      setEnviandoCert(false);
    }
  };

  const handleReactivar = async () => {
    if (!window.confirm(`¿Reactivar a ${operador.nombreCompleto}?`)) return;
    setAccionEnCurso(true);
    try {
      await operadoresService.reactivarOperador(id);
      await cargarOperador();
    } catch {
      setError('No se pudo reactivar al operador');
    } finally {
      setAccionEnCurso(false);
    }
  };

  const confirmarDesactivar = async () => {
    if (!motivoInactivo.trim()) return;
    setAccionEnCurso(true);
    try {
      await operadoresService.desactivarOperador(id, motivoInactivo.trim());
      setModalDesactivar(false);
      await cargarOperador();
    } catch {
      setError('No se pudo desactivar al operador');
    } finally {
      setAccionEnCurso(false);
    }
  };

  if (cargando) return <p className="text-sm text-neutral">Cargando...</p>;
  if (error && !operador) return <p className="text-sm text-red-600">{error}</p>;
  if (!operador) return null;

  return (
    <div>
      <PageHeader
        title={operador.nombreCompleto}
        subtitle={`${operador.empresa?.nombre} · Nivel ${operador.nivel}`}
        actions={
          <>
            <Link
              to={`/operadores/${id}/editar`}
              className="rounded-md border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white"
            >
              Editar operador
            </Link>
            {operador.activo ? (
              <button
                onClick={() => setModalDesactivar(true)}
                className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
              >
                Desactivar operador
              </button>
            ) : (
              <button
                onClick={handleReactivar}
                disabled={accionEnCurso}
                className="rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                Reactivar operador
              </button>
            )}
          </>
        }
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-primary mb-3">Datos personales</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-neutral">Código de operador</dt>
            <dd>{operador.codigoOperador}</dd>
            <dt className="text-neutral">DNI</dt>
            <dd>{operador.dni}</dd>
            <dt className="text-neutral">Fecha de nacimiento</dt>
            <dd>{formatFecha(operador.fechaNacimiento)}</dd>
            <dt className="text-neutral">Edad</dt>
            <dd>{calcularEdad(operador.fechaNacimiento) ?? '—'}</dd>
            <dt className="text-neutral">Celular</dt>
            <dd>{operador.celular || '—'}</dd>
            <dt className="text-neutral">Correo</dt>
            <dd>{operador.correo || '—'}</dd>
            <dt className="text-neutral">LinkedIn</dt>
            <dd>
              {operador.linkedin ? (
                <a href={operador.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  Ver perfil
                </a>
              ) : (
                '—'
              )}
            </dd>
            <dt className="text-neutral">Región</dt>
            <dd>{operador.region}</dd>
            <dt className="text-neutral">Observaciones</dt>
            <dd>{operador.observaciones || '—'}</dd>
          </dl>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Estado</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral">Estado del operador</span>
              <EstadoOperadorBadge activo={operador.activo} />
            </div>
            {!operador.activo && (
              <>
                <div>
                  <p className="text-neutral">Motivo de inactivación</p>
                  <p>{operador.motivoInactivo}</p>
                </div>
                <div>
                  <p className="text-neutral">Fecha de inactivación</p>
                  <p>{formatFecha(operador.fechaInactivacion)}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-primary">Certificaciones</h2>
          <button
            onClick={() => setModalCertAbierto(true)}
            className="rounded-md bg-accent text-white px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            Agregar certificación
          </button>
        </div>

        {operador.certificaciones.length === 0 ? (
          <p className="text-sm text-neutral">Este operador no tiene certificaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-neutral border-b">
                  <th className="py-2">Equipo</th>
                  <th className="py-2">Certificación</th>
                  <th className="py-2">Entidad emisora</th>
                  <th className="py-2">Emisión</th>
                  <th className="py-2">Vencimiento</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Archivo</th>
                </tr>
              </thead>
              <tbody>
                {operador.certificaciones.map((cert) => (
                  <tr key={cert.id} className="border-b last:border-0">
                    <td className="py-2">{cert.equipo?.nombre}</td>
                    <td className="py-2">{cert.nombreCertificacion}</td>
                    <td className="py-2">{cert.entidadEmisora}</td>
                    <td className="py-2">{formatFecha(cert.fechaEmision)}</td>
                    <td className="py-2">{formatFecha(cert.fechaVencimiento)}</td>
                    <td className="py-2">
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </td>
                    <td className="py-2">
                      {cert.archivoUrl ? (
                        <a href={cert.archivoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          Ver
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalCertAbierto} onClose={() => setModalCertAbierto(false)} title="Agregar certificación">
        <CertificacionForm
          equipos={equipos}
          mostrarOperador={false}
          defaultValues={{
            operadorId: id,
            nombreCertificacion: '',
            entidadEmisora: '',
            equipoId: '',
            fechaEmision: '',
            fechaVencimiento: '',
            archivoUrl: '',
            observaciones: '',
          }}
          onSubmit={handleAgregarCertificacion}
          enviando={enviandoCert}
        />
      </Modal>

      <Modal open={modalDesactivar} onClose={() => setModalDesactivar(false)} title="Desactivar operador">
        <p className="text-sm text-neutral mb-3">Indica el motivo de inactivación:</p>
        <textarea
          value={motivoInactivo}
          onChange={(e) => setMotivoInactivo(e.target.value)}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm mb-4"
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

export default OperadorDetallePage;
