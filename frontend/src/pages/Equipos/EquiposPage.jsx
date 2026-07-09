import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import * as equiposService from '../../services/equipos';
import { equipoSchema } from '../../schemas/equipoSchema';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import ExportGridToolbar from '../../components/ExportGridToolbar';
import FormField from '../../components/FormField';
import ModalFormActions from '../../components/ModalFormActions';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { exportarExcel, obtenerValorExportable } from '../../utils/exportExcel';

function EquipoForm({ defaultValues, onSubmit, onCancel, enviando }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(equipoSchema), defaultValues });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12}>
          <FormField
            label="Nombre"
            {...register('nombre')}
            error={Boolean(errors.nombre)}
            helperText={errors.nombre?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <FormField label="Descripción" multiline rows={3} {...register('descripcion')} />
        </Grid>
      </Grid>
      <ModalFormActions onCancel={onCancel} enviando={enviando} />
    </Box>
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
  const [exportando, setExportando] = useState(false);

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

  const columns = [
    { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 180 },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      flex: 1.5,
      minWidth: 220,
      valueGetter: (value) => value || '—',
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => abrirEditar(params.row)}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const columnasExportables = columns.filter((c) => !c.disableExport);
      await exportarExcel({
        columnas: columnasExportables.map((c) => ({ header: c.headerName, key: c.field })),
        filas: equipos.map((fila) =>
          Object.fromEntries(columnasExportables.map((c) => [c.field, obtenerValorExportable(c, fila)]))
        ),
        nombreArchivo: 'equipos-tecport',
        nombreHoja: 'Equipos',
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
        title="Equipos"
        actions={
          <Button onClick={abrirNuevo} variant="contained" startIcon={<AddRoundedIcon />}>
            Nuevo equipo
          </Button>
        }
      />

      <Box sx={{ mb: 2.5, maxWidth: 320 }}>
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre..." fullWidth />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ height: 520 }}>
        <DataGrid
          rows={equipos}
          columns={columns}
          loading={cargando}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          slots={{ toolbar: ExportGridToolbar }}
          slotProps={{ toolbar: { onExport: handleExportarExcel, loading: exportando } }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ border: 'none' }}
        />
      </Card>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title={equipoEditar ? 'Editar equipo' : 'Nuevo equipo'}>
        <EquipoForm
          key={equipoEditar?.id || 'nuevo'}
          defaultValues={equipoEditar || { nombre: '', descripcion: '' }}
          onSubmit={guardar}
          onCancel={() => setModalAbierto(false)}
          enviando={enviando}
        />
      </Modal>
    </Box>
  );
}

export default EquiposPage;
