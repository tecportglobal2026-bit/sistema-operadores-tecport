import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { REGIONES, ESTADOS_CERTIFICACION, ESTADO_CERTIFICACION_LABEL } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import EstadoOperadorBadge from '../../components/EstadoOperadorBadge';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import ExportGridToolbar from '../../components/ExportGridToolbar';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatFecha, calcularEdad } from '../../utils/format';
import { exportarExcel, obtenerValorExportable } from '../../utils/exportExcel';

const PAGE_SIZE = 10;

function mapOperadorARow(op) {
  return {
    id: op.id,
    nombreCompleto: op.nombreCompleto,
    dni: op.dni,
    edad: calcularEdad(op.fechaNacimiento),
    celular: op.celular,
    correo: op.correo,
    linkedin: op.linkedin,
    empresaNombre: op.empresa?.nombre,
    region: op.region,
    nivel: op.nivel,
    equipoNombre: op.certificacionPrincipal?.equipo?.nombre,
    certificacionNombre: op.certificacionPrincipal?.nombreCertificacion || '—',
    vencimiento: op.certificacionPrincipal?.fechaVencimiento,
    estadoCertificacion: op.certificacionPrincipal?.estado,
    activo: op.activo,
  };
}

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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });

  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [operadorDesactivar, setOperadorDesactivar] = useState(null);
  const [motivoInactivo, setMotivoInactivo] = useState('');
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, []);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
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
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      setResultado(data);
    } catch {
      setError('No se pudieron cargar los operadores');
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, region, empresaId, equipoId, activo, estadoCertificacion, paginationModel]);

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

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const data = await operadoresService.listarOperadores({
        search: busquedaDebounced || undefined,
        region: region || undefined,
        empresaId: empresaId || undefined,
        equipoId: equipoId || undefined,
        activo: activo || undefined,
        estadoCertificacion: estadoCertificacion || undefined,
        page: 1,
        pageSize: 10000,
      });
      const filasCompletas = data.data.map(mapOperadorARow);
      const columnasExportables = columns.filter((c) => !c.disableExport);
      await exportarExcel({
        columnas: columnasExportables.map((c) => ({ header: c.headerName, key: c.field })),
        filas: filasCompletas.map((fila) =>
          Object.fromEntries(columnasExportables.map((c) => [c.field, obtenerValorExportable(c, fila)]))
        ),
        nombreArchivo: 'operadores-tecport',
        nombreHoja: 'Operadores',
      });
    } catch {
      setError('No se pudo generar el archivo Excel');
    } finally {
      setExportando(false);
    }
  };

  const columns = [
    {
      field: 'nombreCompleto',
      headerName: 'Nombre',
      flex: 1.3,
      minWidth: 160,
      renderCell: (params) => (
        <Link component={RouterLink} to={`/operadores/${params.row.id}`} fontWeight={600}>
          {params.value}
        </Link>
      ),
    },
    { field: 'dni', headerName: 'DNI', width: 110 },
    { field: 'edad', headerName: 'Edad', width: 80, valueGetter: (value) => value ?? '—' },
    { field: 'celular', headerName: 'Celular', width: 130, valueGetter: (value) => value || '—' },
    { field: 'correo', headerName: 'Correo', width: 200, valueGetter: (value) => value || '—' },
    {
      field: 'linkedin',
      headerName: 'LinkedIn',
      width: 110,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Link href={params.value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            Ver perfil
          </Link>
        ) : (
          '—'
        ),
    },
    { field: 'empresaNombre', headerName: 'Empresa', flex: 1, minWidth: 140 },
    { field: 'region', headerName: 'Región', width: 100 },
    { field: 'nivel', headerName: 'Nivel', width: 120 },
    { field: 'equipoNombre', headerName: 'Equipo', width: 140, valueGetter: (value) => value || '—' },
    { field: 'certificacionNombre', headerName: 'Certificación', flex: 1, minWidth: 160 },
    {
      field: 'vencimiento',
      headerName: 'Vencimiento',
      width: 120,
      valueGetter: (value) => formatFecha(value),
    },
    {
      field: 'estadoCertificacion',
      headerName: 'Estado cert.',
      width: 140,
      valueFormatter: (value) => (value ? ESTADO_CERTIFICACION_LABEL[value] : '—'),
      renderCell: (params) => (params.value ? <EstadoCertificacionBadge estado={params.value} /> : '—'),
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      valueFormatter: (value) => (value ? 'Activo' : 'Inactivo'),
      renderCell: (params) => <EstadoOperadorBadge activo={params.value} />,
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 130,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" component={RouterLink} to={`/operadores/${params.row.id}/editar`}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.activo ? (
            <Tooltip title="Desactivar">
              <IconButton size="small" color="error" onClick={() => abrirDesactivar(params.row)}>
                <BlockRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Reactivar">
              <IconButton size="small" color="success" onClick={() => handleReactivar(params.row)} disabled={accionEnCurso}>
                <CheckCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const rows = resultado.data.map(mapOperadorARow);

  return (
    <Box>
      <PageHeader
        title="Operadores"
        actions={
          <Button
            component={RouterLink}
            to="/operadores/nuevo"
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            Nuevo operador
          </Button>
        }
      />

      <Card sx={{ p: 2.5, mb: 2.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Nombre, DNI o empresa..." fullWidth />
          </Grid>
          <Grid item xs={6} sm={3} md={1.8}>
            <TextField select fullWidth size="small" label="Región" value={region} onChange={(e) => setRegion(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {REGIONES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Empresa"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {empresas.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField select fullWidth size="small" label="Equipo" value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {equipos.map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>
                  {eq.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={1.4}>
            <TextField select fullWidth size="small" label="Estado" value={activo} onChange={(e) => setActivo(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={1.4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Certificación"
              value={estadoCertificacion}
              onChange={(e) => setEstadoCertificacion(e.target.value)}
            >
              <MenuItem value="">Cualquiera</MenuItem>
              {ESTADOS_CERTIFICACION.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {ESTADO_CERTIFICACION_LABEL[estado]}
                </MenuItem>
              ))}
              <MenuItem value="sin_certificacion">Sin certificación</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={cargando}
          rowCount={resultado.total}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          slots={{ toolbar: ExportGridToolbar }}
          slotProps={{ toolbar: { onExport: handleExportarExcel, loading: exportando } }}
          initialState={{
            pinnedColumns: { left: ['nombreCompleto'], right: ['acciones'] },
            columns: {
              columnVisibilityModel: { edad: false, celular: false, correo: false, linkedin: false },
            },
          }}
          sx={{ border: 'none' }}
        />
      </Card>

      <Modal open={Boolean(operadorDesactivar)} onClose={() => setOperadorDesactivar(null)} title="Desactivar operador">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vas a desactivar a <strong>{operadorDesactivar?.nombreCompleto}</strong>. Indica el motivo:
        </Typography>
        <TextField
          value={motivoInactivo}
          onChange={(e) => setMotivoInactivo(e.target.value)}
          multiline
          rows={3}
          fullWidth
          placeholder="Motivo de inactivación"
        />
        <DialogActions sx={{ px: 0, pt: 3 }}>
          <Button variant="outlined" color="inherit" onClick={() => setOperadorDesactivar(null)} disabled={accionEnCurso}>
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

export default OperadoresPage;
