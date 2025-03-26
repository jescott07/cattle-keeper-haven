
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

// Conversion factors to grams (for weight units) or to milliliters (for volume units)
export const UNIT_CONVERSION_FACTORS: Record<string, number> = {
  'g': 1, // 1 gram = 1 gram
  'kg': 1000, // 1 kg = 1000 grams
  't': 1000000, // 1 ton = 1,000,000 grams
  'ml': 1, // 1 ml = 1 ml
  'L': 1000, // 1 L = 1000 ml
  'unt': 1 // No conversion for units
};

// Convert value from one unit to another
export const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  // If units are the same, no conversion needed
  if (fromUnit === toUnit) return value;
  
  // If either unit is not recognized, return original value
  if (!(fromUnit in UNIT_CONVERSION_FACTORS) || !(toUnit in UNIT_CONVERSION_FACTORS)) {
    return value;
  }
  
  // Check if we're dealing with weight or volume units
  const isFromWeight = ['g', 'kg', 't'].includes(fromUnit);
  const isToWeight = ['g', 'kg', 't'].includes(toUnit);
  const isFromVolume = ['ml', 'L'].includes(fromUnit);
  const isToVolume = ['ml', 'L'].includes(toUnit);
  
  // We can only convert between the same type of units (weight to weight, volume to volume)
  if ((isFromWeight && !isToWeight) || (isFromVolume && !isToVolume)) {
    // Units are incompatible for conversion
    return value;
  }
  
  // Convert to base unit (g or ml) then to target unit
  const valueInBaseUnit = value * UNIT_CONVERSION_FACTORS[fromUnit];
  return valueInBaseUnit / UNIT_CONVERSION_FACTORS[toUnit];
};
