const VARIANTS = {
  verde: 'bg-green-100 text-green-700',
  naranja: 'bg-orange-100 text-orange-700',
  rojo: 'bg-red-100 text-red-700',
  gris: 'bg-gray-100 text-gray-600',
};

function Badge({ variant = 'gris', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;
