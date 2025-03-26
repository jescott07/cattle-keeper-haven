
// Standard units for inventory items
export const STANDARD_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 't', label: 'Tons (t)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'unt', label: 'Units (unt)' }
];

// Get unit label by value
export const getUnitLabel = (value: string): string => {
  const unit = STANDARD_UNITS.find(unit => unit.value === value);
  return unit ? unit.label : value;
};
