export function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  }
  // Indian grouping for smaller amounts
  return `${sign}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatINRAxis(value) {
  if (value === 0) return '₹0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(0)} L`;
  return `${sign}₹${(abs / 1000).toFixed(0)} K`;
}
