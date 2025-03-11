
import { Lot, BreedType } from '@/lib/types';

interface BreedCount {
  breed: BreedType;
  breedName: string;
  count: number;
}

export function extractBreedCounts(lot: Lot): BreedCount[] {
  const result: BreedCount[] = [];
  
  if (!lot.notes) {
    // If no notes but a breed is set, assume all animals are of that breed
    if (lot.breed) {
      result.push({
        breed: lot.breed,
        breedName: formatBreedName(lot.breed),
        count: lot.numberOfAnimals
      });
    }
    return result;
  }
  
  // Try to extract breed counts from notes
  const breedRegex = /(\d+)\s+(nelore|anelorada|cruzamento-industrial)/gi;
  let match;
  
  while ((match = breedRegex.exec(lot.notes)) !== null) {
    result.push({
      count: parseInt(match[1]),
      breed: match[2].toLowerCase() as BreedType,
      breedName: formatBreedName(match[2].toLowerCase() as BreedType)
    });
  }
  
  // If no matches found but a breed is set, use that
  if (result.length === 0 && lot.breed) {
    result.push({
      breed: lot.breed,
      breedName: formatBreedName(lot.breed),
      count: lot.numberOfAnimals
    });
  }
  
  return result;
}

export function formatBreedName(breed: BreedType): string {
  switch (breed) {
    case 'nelore':
      return 'Nelore';
    case 'anelorada':
      return 'Anelorada';
    case 'cruzamento-industrial':
      return 'Cruzamento Industrial';
    default:
      return breed;
  }
}
