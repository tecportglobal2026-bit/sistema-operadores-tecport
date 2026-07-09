import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name } = payload[0].payload;
  const { value } = payload[0];
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

function SimpleBarChart({ data, dataKey, nameKey, color }) {
  const height = Math.max(140, data.length * 46);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e1e0d9" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#898781' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
        <YAxis
          type="category"
          dataKey={nameKey}
          tick={{ fontSize: 13, fill: '#52514e' }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,53,88,0.06)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
          <LabelList dataKey={dataKey} position="right" style={{ fill: '#0b0b0b', fontSize: 12, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default SimpleBarChart;
