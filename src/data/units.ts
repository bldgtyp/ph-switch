import { Unit, UnitCategory } from '../types/units';

// Length unit category
export const lengthCategory: UnitCategory = {
  id: 'length',
  name: 'Length',
  baseUnit: 'meter',
};

// Length units with conversion factors to meters
export const lengthUnits: Unit[] = [
  {
    id: 'meter',
    name: 'meter',
    symbol: 'm',
    aliases: ['m', 'meter', 'meters', 'metre', 'metres'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 1.0,
  },
  {
    id: 'foot',
    name: 'foot',
    symbol: 'ft',
    aliases: ['ft', 'foot', 'feet', "'"],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 0.3048,
  },
  {
    id: 'inch',
    name: 'inch',
    symbol: 'in',
    aliases: ['in', 'inch', 'inches', '"'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 0.0254,
  },
  {
    id: 'centimeter',
    name: 'centimeter',
    symbol: 'cm',
    aliases: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 0.01,
  },
  {
    id: 'millimeter',
    name: 'millimeter',
    symbol: 'mm',
    aliases: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 0.001,
  },
  {
    id: 'kilometer',
    name: 'kilometer',
    symbol: 'km',
    aliases: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 1000.0,
  },
  {
    id: 'mile',
    name: 'mile',
    symbol: 'mi',
    aliases: ['mi', 'mile', 'miles'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 1609.344,
  },
  {
    id: 'yard',
    name: 'yard',
    symbol: 'yd',
    aliases: ['yd', 'yard', 'yards'],
    category: lengthCategory,
    baseUnit: 'meter',
    conversionFactor: 0.9144,
  },
];

// All available units (extensible for future categories)
export const allUnits: Unit[] = [...lengthUnits];

// All available categories
export const allCategories: UnitCategory[] = [lengthCategory];
