import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumen } from '../../services/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import EstadoCertificacionBadge from '../../components/EstadoCertificacionBadge';
import { formatFecha } from '../../utils/format';

function DashboardPage() {
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

  if (cargando) return <p className="text-sm text-neutral">Cargando dashboard...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen general del sistema" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Operadores totales" value={resumen.totalOperadores} />
        <StatCard label="Operadores activos" value={resumen.operadoresActivos} />
        <StatCard label="Operadores inactivos" value={resumen.operadoresInactivos} />
        <StatCard label="Empresas" value={resumen.totalEmpresas} />
        <StatCard label="Equipos" value={resumen.totalEquipos} />
        <StatCard label="Certificaciones vigentes" value={resumen.certificacionesVigentes} />
        <StatCard label="Por vencer (30 días)" value={resumen.certificacionesPorVencer} variant="warning" />
        <StatCard label="Certificaciones vencidas" value={resumen.certificacionesVencidas} variant="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Operadores por región</h2>
          <ul className="space-y-2">
            {resumen.operadoresPorRegion.map((item) => (
              <li key={item.region} className="flex justify-between text-sm">
                <span className="text-neutral">{item.region}</span>
                <span className="font-medium text-primary">{item.total}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Operadores por equipo</h2>
          <ul className="space-y-2">
            {resumen.operadoresPorEquipo.map((item) => (
              <li key={item.equipoId} className="flex justify-between text-sm">
                <span className="text-neutral">{item.equipo}</span>
                <span className="font-medium text-primary">{item.totalOperadores}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-primary mb-3">Certificaciones próximas a vencer</h2>
        {resumen.certificacionesProximasAVencer.length === 0 ? (
          <p className="text-sm text-neutral">No hay certificaciones por vencer en los próximos 30 días.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-neutral border-b">
                  <th className="py-2">Operador</th>
                  <th className="py-2">Equipo</th>
                  <th className="py-2">Certificación</th>
                  <th className="py-2">Vence</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {resumen.certificacionesProximasAVencer.map((cert) => (
                  <tr key={cert.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link to={`/operadores/${cert.operador.id}`} className="text-primary hover:underline">
                        {cert.operador.nombreCompleto}
                      </Link>
                    </td>
                    <td className="py-2">{cert.equipo.nombre}</td>
                    <td className="py-2">{cert.nombreCertificacion}</td>
                    <td className="py-2">{formatFecha(cert.fechaVencimiento)}</td>
                    <td className="py-2">
                      <EstadoCertificacionBadge estado={cert.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;
