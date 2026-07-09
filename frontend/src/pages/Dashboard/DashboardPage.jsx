import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { obtenerResumen } from '../../services/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import EstadoCertificacionesPieChart from '../../components/charts/EstadoCertificacionesPieChart';
import { formatFecha } from '../../utils/format';

function DashboardPage() {
  const theme = useTheme();
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerResumen()
      .then((data) => activo && setResumen(data))
      .catch(() => activo && setError('No se pudo cargar el resumen'))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Resumen general del sistema" />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Operadores totales" value={resumen.totalOperadores} icon={<GroupsRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Operadores activos" value={resumen.operadoresActivos} icon={<CheckCircleRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Operadores inactivos" value={resumen.operadoresInactivos} icon={<PersonOffRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Empresas" value={resumen.totalEmpresas} icon={<ApartmentRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Equipos" value={resumen.totalEquipos} icon={<PrecisionManufacturingRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Certificaciones vigentes" value={resumen.certificacionesVigentes} icon={<CheckCircleRoundedIcon />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Por vencer (30 días)"
            value={resumen.certificacionesPorVencer}
            variant="warning"
            icon={<WarningRoundedIcon />}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Certificaciones vencidas"
            value={resumen.certificacionesVencidas}
            variant="danger"
            icon={<CancelRoundedIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
              Operadores por región
            </Typography>
            {resumen.operadoresPorRegion.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin datos todavía.
              </Typography>
            ) : (
              <SimpleBarChart
                data={resumen.operadoresPorRegion.map((item) => ({ name: item.region, total: item.total }))}
                dataKey="total"
                nameKey="name"
                color={theme.palette.primary.main}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
              Operadores por equipo
            </Typography>
            {resumen.operadoresPorEquipo.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin datos todavía.
              </Typography>
            ) : (
              <SimpleBarChart
                data={resumen.operadoresPorEquipo.map((item) => ({ name: item.equipo, total: item.totalOperadores }))}
                dataKey="total"
                nameKey="name"
                color={theme.palette.primary.main}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
              Certificaciones por estado
            </Typography>
            <EstadoCertificacionesPieChart
              data={[
                { name: 'Vigente', value: resumen.certificacionesVigentes },
                { name: 'Por vencer', value: resumen.certificacionesPorVencer },
                { name: 'Vencido', value: resumen.certificacionesVencidas },
              ]}
            />
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
          Certificaciones próximas a vencer
        </Typography>
        {resumen.certificacionesProximasAVencer.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay certificaciones por vencer en los próximos 30 días.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Operador</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Certificación</TableCell>
                  <TableCell>Vence</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resumen.certificacionesProximasAVencer.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell>
                      <Link to={`/operadores/${cert.operador.id}`} style={{ color: 'inherit', fontWeight: 600 }}>
                        {cert.operador.nombreCompleto}
                      </Link>
                    </TableCell>
                    <TableCell>{cert.equipo.nombre}</TableCell>
                    <TableCell>{cert.nombreCertificacion}</TableCell>
                    <TableCell>{formatFecha(cert.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default DashboardPage;
