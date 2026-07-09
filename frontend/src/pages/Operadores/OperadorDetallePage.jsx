import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
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
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import * as operadoresService from '../../services/operadores';
import * as equiposService from '../../services/equipos';
import * as certificacionesService from '../../services/certificaciones';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import EstadoOperadorBadge from '../../components/EstadoOperadorBadge';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import CertificacionForm from '../../components/CertificacionForm';
import { formatFecha, calcularEdad } from '../../utils/format';

function DatoFila({ label, valor }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary" textAlign="right">
        {valor}
      </Typography>
    </Box>
  );
}

function SeccionCard({ icon, titulo, accion, children }) {
  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& svg': { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {titulo}
          </Typography>
        </Stack>
        {accion}
      </Box>
      <Box sx={{ px: 3, py: 1 }}>{children}</Box>
    </Card>
  );
}

const NIVEL_COLOR = {
  Principiante: 'default',
  Intermedio: 'info',
  Avanzado: 'warning',
  Maestro: 'success',
};

function obtenerIniciales(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  const iniciales = partes.slice(0, 2).map((p) => p[0]);
  return iniciales.join('').toUpperCase();
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
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {obtenerIniciales(operador.nombreCompleto)}
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {operador.nombreCompleto}
              </Typography>
              <EstadoOperadorBadge activo={operador.activo} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {operador.empresa?.nombre} · {operador.region}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={operador.codigoOperador}
                sx={{ fontFamily: 'monospace', fontWeight: 600, height: 22 }}
              />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
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
              variant="outlined"
              color="error"
              startIcon={<BlockRoundedIcon />}
            >
              Desactivar
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
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={6}>
          <SeccionCard icon={<PersonRoundedIcon />} titulo="Datos personales">
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
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Observaciones
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {operador.observaciones || '—'}
              </Typography>
            </Box>
          </SeccionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SeccionCard icon={<BusinessCenterRoundedIcon />} titulo="Datos laborales">
            <DatoFila label="Empresa" valor={operador.empresa?.nombre || '—'} />
            <DatoFila label="Región" valor={operador.region} />
            <DatoFila
              label="Nivel"
              valor={
                <Chip
                  size="small"
                  variant="outlined"
                  color={NIVEL_COLOR[operador.nivel] || 'default'}
                  label={operador.nivel}
                />
              }
            />
            {!operador.activo && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <DatoFila label="Motivo de inactivación" valor={operador.motivoInactivo} />
                <DatoFila label="Fecha de inactivación" valor={formatFecha(operador.fechaInactivacion)} />
              </>
            )}
          </SeccionCard>
        </Grid>
      </Grid>

      <SeccionCard
        icon={<WorkspacePremiumRoundedIcon />}
        titulo="Certificaciones"
        accion={
          <Button
            onClick={() => setModalCertAbierto(true)}
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<AddRoundedIcon />}
          >
            Agregar certificación
          </Button>
        }
      >
        {operador.certificaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
            Este operador no tiene certificaciones registradas.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', mx: -3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Equipo</TableCell>
                  <TableCell>Certificación</TableCell>
                  <TableCell>Entidad emisora</TableCell>
                  <TableCell>Emisión</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell sx={{ pr: 3 }}>Archivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operador.certificaciones.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell sx={{ pl: 3 }}>{cert.equipo?.nombre}</TableCell>
                    <TableCell>{cert.nombreCertificacion}</TableCell>
                    <TableCell>{cert.entidadEmisora}</TableCell>
                    <TableCell>{formatFecha(cert.fechaEmision)}</TableCell>
                    <TableCell>{formatFecha(cert.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </TableCell>
                    <TableCell sx={{ pr: 3 }}>
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
      </SeccionCard>

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
