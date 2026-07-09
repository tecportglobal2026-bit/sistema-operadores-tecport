import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import DialogActions from '@mui/material/DialogActions';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
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

function DatoFila({ label, valor }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {valor}
      </Typography>
    </Box>
  );
}

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

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error && !operador) return <Alert severity="error">{error}</Alert>;
  if (!operador) return null;

  return (
    <Box>
      <PageHeader
        title={operador.nombreCompleto}
        subtitle={`${operador.empresa?.nombre} · Nivel ${operador.nivel}`}
        actions={
          <>
            <Button
              component={RouterLink}
              to={`/operadores/${id}/editar`}
              variant="outlined"
              startIcon={<EditRoundedIcon />}
            >
              Editar operador
            </Button>
            {operador.activo ? (
              <Button
                onClick={() => setModalDesactivar(true)}
                variant="contained"
                color="error"
                startIcon={<BlockRoundedIcon />}
              >
                Desactivar operador
              </Button>
            ) : (
              <Button
                onClick={handleReactivar}
                disabled={accionEnCurso}
                variant="contained"
                color="success"
                startIcon={<CheckCircleRoundedIcon />}
              >
                Reactivar operador
              </Button>
            )}
          </>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
              Datos personales
            </Typography>
            <DatoFila label="Código de operador" valor={operador.codigoOperador} />
            <DatoFila label="DNI" valor={operador.dni} />
            <DatoFila label="Fecha de nacimiento" valor={formatFecha(operador.fechaNacimiento)} />
            <DatoFila label="Edad" valor={calcularEdad(operador.fechaNacimiento) ?? '—'} />
            <DatoFila label="Celular" valor={operador.celular || '—'} />
            <DatoFila label="Correo" valor={operador.correo || '—'} />
            <DatoFila
              label="LinkedIn"
              valor={
                operador.linkedin ? (
                  <Link href={operador.linkedin} target="_blank" rel="noreferrer">
                    Ver perfil
                  </Link>
                ) : (
                  '—'
                )
              }
            />
            <DatoFila label="Región" valor={operador.region} />
            <DatoFila label="Observaciones" valor={operador.observaciones || '—'} />
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>
              Estado
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Estado del operador
              </Typography>
              <EstadoOperadorBadge activo={operador.activo} />
            </Box>
            {!operador.activo && (
              <>
                <DatoFila label="Motivo de inactivación" valor={operador.motivoInactivo} />
                <DatoFila label="Fecha de inactivación" valor={formatFecha(operador.fechaInactivacion)} />
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            Certificaciones
          </Typography>
          <Button
            onClick={() => setModalCertAbierto(true)}
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AddRoundedIcon />}
          >
            Agregar certificación
          </Button>
        </Box>

        {operador.certificaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Este operador no tiene certificaciones registradas.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Certificación</TableCell>
                  <TableCell>Entidad emisora</TableCell>
                  <TableCell>Emisión</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Archivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operador.certificaciones.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell>{cert.equipo?.nombre}</TableCell>
                    <TableCell>{cert.nombreCertificacion}</TableCell>
                    <TableCell>{cert.entidadEmisora}</TableCell>
                    <TableCell>{formatFecha(cert.fechaEmision)}</TableCell>
                    <TableCell>{formatFecha(cert.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </TableCell>
                    <TableCell>
                      {cert.archivoUrl ? (
                        <Link href={cert.archivoUrl} target="_blank" rel="noreferrer">
                          Ver
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
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
          onCancel={() => setModalCertAbierto(false)}
          enviando={enviandoCert}
        />
      </Modal>

      <Modal open={modalDesactivar} onClose={() => setModalDesactivar(false)} title="Desactivar operador">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Indica el motivo de inactivación:
        </Typography>
        <TextField
          value={motivoInactivo}
          onChange={(e) => setMotivoInactivo(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
        <DialogActions sx={{ px: 0, pt: 3 }}>
          <Button variant="outlined" color="inherit" onClick={() => setModalDesactivar(false)} disabled={accionEnCurso}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarDesactivar}
            disabled={accionEnCurso || !motivoInactivo.trim()}
            variant="contained"
            color="error"
          >
            {accionEnCurso ? 'Procesando...' : 'Confirmar desactivación'}
          </Button>
        </DialogActions>
      </Modal>
    </Box>
  );
}

export default OperadorDetallePage;
