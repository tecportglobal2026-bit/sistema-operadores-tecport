import Card from './Card';

const COLOR_MAP = {
  default: 'text-primary',
  warning: 'text-accent',
  danger: 'text-red-600',
};

function StatCard({ label, value, variant = 'default' }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-neutral">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${COLOR_MAP[variant]}`}>{value}</p>
    </Card>
  );
}

export default StatCard;
