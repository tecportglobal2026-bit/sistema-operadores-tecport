import { useCallback, useEffect, useState } from 'react';
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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import * as certificacionesService from '../../services/certificaciones';
import * as operadoresService from '../../services/operadores';
import * as empresasService from '../../services/empresas';
import * as equiposService from '../../services/equipos';
import { ESTADOS_CERTIFICACION, ESTADO_CERTIFICACION_LABEL } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import CertificacionForm from '../../components/CertificacionForm';
import ExportGridToolbar from '../../components/ExportGridToolbar';
import { formatFecha, formatFechaInput } from '../../utils/format';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { exportarExcel, obtenerValorExportable } from '../../utils/exportExcel';

const PAGE_SIZE = 10;

function mapCertificacionARow(cert) {
  return {
    ...cert,
    operadorNombre: cert.operador?.nombreCompleto,
    empresaNombre: cert.operador?.empresa?.nombre,
    equipoNombre: cert.equipo?.nombre,
  };
}

function CertificacionesPage() {
  const [operadores, setOperadores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda);
  const [empresaId, setEmpresaId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [estado, setEstado] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });

  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [certificacionEditar, setCertificacionEditar] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    operadoresService
      .listarOperadores({ pageSize: 1000 })
      .then((res) => setOperadores(res.data))
      .catch(() => {});
    empresasService.listarEmpresas().then(setEmpresas).catch(() => {});
    equiposService.listarEquipos().then(setEquipos).catch(() => {});
  }, []);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
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
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      setResultado(data);
    } catch {
      setError('No se pudieron cargar las certificaciones');
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, empresaId, equipoId, estado, paginationModel]);

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

  const columns = [
    { field: 'operadorNombre', headerName: 'Operador', flex: 1, minWidth: 160, fontWeight: 600 },
    { field: 'empresaNombre', headerName: 'Empresa', flex: 1, minWidth: 150 },
    { field: 'equipoNombre', headerName: 'Equipo', flex: 0.9, minWidth: 130 },
    { field: 'nombreCertificacion', headerName: 'Certificación', flex: 1.1, minWidth: 160 },
    {
      field: 'fechaVencimiento',
      headerName: 'Vence',
      width: 120,
      valueGetter: (value) => formatFecha(value),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      valueFormatter: (value) => ESTADO_CERTIFICACION_LABEL[value] ?? value,
      renderCell: (params) => <EstadoCertificacionBadge estado={params.value} />,
    },
    {
      field: 'archivoUrl',
      headerName: 'Archivo',
      width: 90,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Link href={params.value} target="_blank" rel="noreferrer">
            Ver
          </Link>
        ) : (
          '—'
        ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 110,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => abrirEditar(params.row)}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.estado !== 'inactivo' && (
            <Tooltip title="Inactivar">
              <IconButton size="small" color="error" onClick={() => handleInactivar(params.row)}>
                <BlockRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const rows = resultado.data.map(mapCertificacionARow);

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const data = await certificacionesService.listarCertificaciones({
        search: busquedaDebounced || undefined,
        empresaId: empresaId || undefined,
        equipoId: equipoId || undefined,
        estado: estado || undefined,
        page: 1,
        pageSize: 10000,
      });
      const filasCompletas = data.data.map(mapCertificacionARow);
      const columnasExportables = columns.filter((c) => !c.disableExport);
      await exportarExcel({
        columnas: columnasExportables.map((c) => ({ header: c.headerName, key: c.field })),
        filas: filasCompletas.map((fila) =>
          Object.fromEntries(columnasExportables.map((c) => [c.field, obtenerValorExportable(c, fila)]))
        ),
        nombreArchivo: 'certificaciones-tecport',
        nombreHoja: 'Certificaciones',
      });
    } catch {
      setError('No se pudo generar el archivo Excel');
    } finally {
      setExportando(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Certificaciones"
        actions={
          <Button onClick={abrirNueva} variant="contained" startIcon={<AddRoundedIcon />}>
            Nueva certificación
          </Button>
        }
      />

      <Card sx={{ p: 2.5, mb: 2.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Operador, DNI o certificación..." fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth size="small" label="Equipo" value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {equipos.map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>
                  {eq.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth size="small" label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS_CERTIFICACION.map((est) => (
                <MenuItem key={est} value={est}>
                  {ESTADO_CERTIFICACION_LABEL[est]}
                </MenuItem>
              ))}
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
          sx={{ border: 'none' }}
        />
      </Card>

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
          onCancel={() => setModalAbierto(false)}
          enviando={enviando}
        />
      </Modal>
    </Box>
  );
}

export default CertificacionesPage;
