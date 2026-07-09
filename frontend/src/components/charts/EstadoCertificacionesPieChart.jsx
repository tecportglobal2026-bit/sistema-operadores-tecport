import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1, boxShadow: 2 }}>
      <Typography variant="body2" fontWeight={700} color="text.primary">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {name}
      </Typography>
    </Box>
  );
}

// Etiquetas directas en cada segmento: el verde y el naranja no pasan el chequeo
// de daltonismo (protanopia) por sí solos, así que el nombre nunca depende solo del color.
// Se mantiene corta (solo el nombre) para que no se recorte en la columna angosta;
// el valor y el porcentaje exactos quedan en el tooltip y la leyenda.
function renderLabel({ name, value, x, y, textAnchor }) {
  if (!value) return null;
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontSize={12} fill="#52514e">
      {name}
    </text>
  );
}

function EstadoCertificacionesPieChart({ data }) {
  const theme = useTheme();
  const colores = {
    Vigente: theme.palette.success.main,
    'Por vencer': theme.palette.warning.main,
    Vencido: theme.palette.error.main,
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart margin={{ top: 16, right: 48, bottom: 16, left: 48 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={68}
          paddingAngle={3}
          isAnimationActive={false}
          label={renderLabel}
          labelLine
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={colores[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={32}
          formatter={(value) => <span style={{ color: '#52514e', fontSize: 13 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default EstadoCertificacionesPieChart;
