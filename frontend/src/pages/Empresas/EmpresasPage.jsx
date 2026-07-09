import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import * as empresasService from '../../services/empresas';
import { empresaSchema } from '../../schemas/empresaSchema';
import { TIPOS_EMPRESA, REGIONES } from '../../utils/constants';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchInput from '../../components/SearchInput';
import ExportGridToolbar from '../../components/ExportGridToolbar';
import FormField from '../../components/FormField';
import ModalFormActions from '../../components/ModalFormActions';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { exportarExcel, obtenerValorExportable } from '../../utils/exportExcel';

function EmpresaForm({ defaultValues, onSubmit, onCancel, enviando }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(empresaSchema), defaultValues });

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
          <FormField label="RUC" {...register('ruc')} />
        </Grid>
        <Grid item xs={12}>
          <FormField
            select
            label="Tipo de empresa"
            defaultValue={defaultValues.tipoEmpresa || ''}
            {...register('tipoEmpresa')}
            error={Boolean(errors.tipoEmpresa)}
            helperText={errors.tipoEmpresa?.message}
          >
            <MenuItem value="">Selecciona...</MenuItem>
            {TIPOS_EMPRESA.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </FormField>
        </Grid>
        <Grid item xs={12}>
          <FormField
            select
            label="Región"
            defaultValue={defaultValues.region || ''}
            {...register('region')}
            error={Boolean(errors.region)}
            helperText={errors.region?.message}
          >
            <MenuItem value="">Selecciona...</MenuItem>
            {REGIONES.map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </FormField>
        </Grid>
      </Grid>
      <ModalFormActions onCancel={onCancel} enviando={enviando} />
    </Box>
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
  const [exportando, setExportando] = useState(false);

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

  const columns = [
    { field: 'nombre', headerName: 'Nombre', flex: 1.2, minWidth: 180 },
    { field: 'ruc', headerName: 'RUC', width: 130, valueGetter: (value) => value || '—' },
    { field: 'tipoEmpresa', headerName: 'Tipo', width: 140 },
    { field: 'region', headerName: 'Región', width: 120 },
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
        filas: empresas.map((fila) =>
          Object.fromEntries(columnasExportables.map((c) => [c.field, obtenerValorExportable(c, fila)]))
        ),
        nombreArchivo: 'empresas-tecport',
        nombreHoja: 'Empresas',
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
        title="Empresas"
        actions={
          <Button onClick={abrirNueva} variant="contained" startIcon={<AddRoundedIcon />}>
            Nueva empresa
          </Button>
        }
      />

      <Box sx={{ mb: 2.5, maxWidth: 320 }}>
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o RUC..." fullWidth />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ height: 520 }}>
        <DataGrid
          rows={empresas}
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

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={empresaEditar ? 'Editar empresa' : 'Nueva empresa'}
      >
        <EmpresaForm
          key={empresaEditar?.id || 'nueva'}
          defaultValues={empresaEditar || { nombre: '', ruc: '', tipoEmpresa: '', region: '' }}
          onSubmit={guardar}
          onCancel={() => setModalAbierto(false)}
          enviando={enviando}
        />
      </Modal>
    </Box>
  );
}

export default EmpresasPage;
