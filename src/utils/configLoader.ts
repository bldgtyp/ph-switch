// Configuration loader utility for JSON unit definitions
// Handles async loading, validation, and TypeScript type safety

import Ajv from 'ajv';
import schema from '../config/schema.json';
import lengthConfig from '../config/length.json';
import areaConfig from '../config/area.json';
import volumeConfig from '../config/volume.json';
import temperatureConfig from '../config/temperature.json';
import airflowConfig from '../config/airflow.json';
import airflowEnvelopeConfig from '../config/airflow-envelope.json';
import massConfig from '../config/mass.json';
import energyConfig from '../config/energy.json';
import powerConfig from '../config/power.json';
import powerIntensityConfig from '../config/power-intensity.json';
import energyIntensityConfig from '../config/energy-intensity.json';
import energyEfficiencyConfig from '../config/energy-efficiency.json';
import densityConfig from '../config/density.json';
import speedConfig from '../config/speed.json';
import humidityConfig from '../config/humidity.json';
import heatCapacityByVolumeConfig from '../config/heat-capacity-by-volume.json';
import heatCapacityByAreaConfig from '../config/heat-capacity-by-area.json';
import {
  UnitCategory,
  ConfigurationLoadResult,
  ValidationResult,
} from '../types';
import { evaluateExpressionToNumber } from './transformEvaluator';

// Initialize AJV validator with schema
const ajv = new Ajv();
const validate = ajv.compile(schema);

/**
 * Validates a unit configuration against the JSON schema
 */
export function validateConfiguration(config: any): ValidationResult {
  const valid = validate(config);

  if (valid) {
    return { valid: true };
  }

  const errors = validate.errors?.map((error) => {
    const path = error.instancePath || 'root';
    return `${path}: ${error.message}`;
  }) || ['Unknown validation error'];

  return {
    valid: false,
    errors,
  };
}

/**
 * Loads and validates a single unit configuration
 */
export function loadUnitCategory(
  config: any,
  categoryName: string
): UnitCategory | null {
  const validation = validateConfiguration(config);

  if (!validation.valid) {
    console.error(
      `Configuration validation failed for ${categoryName}:`,
      validation.errors
    );
    return null;
  }

  // Additional runtime validation
  if (config.category !== categoryName) {
    console.error(
      `Category name mismatch: expected ${categoryName}, got ${config.category}`
    );
    return null;
  }

  // Verify base unit exists in units
  if (!config.units[config.baseUnit]) {
    console.error(
      `Base unit '${config.baseUnit}' not found in units for category ${categoryName}`
    );
    return null;
  }
  // Verify base unit is normalized to base. Accept either factor === 1 or transform identity
  const baseDef = config.units[config.baseUnit];
  const baseIsValid =
    (typeof baseDef.factor === 'number' && baseDef.factor === 1) ||
    (baseDef.transform &&
      baseDef.transform.toBase &&
      baseDef.transform.fromBase);

  if (!baseIsValid) {
    console.error(
      `Base unit '${config.baseUnit}' must either have factor 1 or provide transform toBase/fromBase`
    );
    return null;
  }

  // Backfill numeric 'factor' for units that provide transforms only.
  // This provides backward-compatibility for code/tests that expect a numeric factor.
  const evaluateToNumber = (expr: string): number | null => {
    return evaluateExpressionToNumber(expr, 1);
  };
  // Work on a deep clone so we don't mutate the imported JSON objects
  const workingConfig = JSON.parse(JSON.stringify(config));

  Object.entries(workingConfig.units).forEach(([unitKey, unitDataRaw]) => {
    const unitData: any = unitDataRaw;

    if (
      typeof unitData.factor !== 'number' &&
      unitData.transform &&
      unitData.transform.toBase
    ) {
      const computed = evaluateToNumber(unitData.transform.toBase);
      if (computed !== null) {
        unitData.factor = computed;
      }
    }
  });

  return workingConfig as UnitCategory;
}

/**
 * Loads all available unit configurations
 * Currently hardcoded for available categories, will expand in Phase 3
 */
export async function loadAllConfigurations(): Promise<ConfigurationLoadResult> {
  try {
    const categories: Record<string, UnitCategory> = {};

    // Load length configuration
    const lengthCategory = loadUnitCategory(lengthConfig, 'length');
    if (lengthCategory) {
      categories.length = lengthCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load length unit configuration',
      };
    }

    // Load area configuration
    const areaCategory = loadUnitCategory(areaConfig, 'area');
    if (areaCategory) {
      categories.area = areaCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load area unit configuration',
      };
    }

    // Load volume configuration
    const volumeCategory = loadUnitCategory(volumeConfig, 'volume');
    if (volumeCategory) {
      categories.volume = volumeCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load volume unit configuration',
      };
    }

    // Load temperature configuration
    const temperatureCategory = loadUnitCategory(
      temperatureConfig,
      'temperature'
    );
    if (temperatureCategory) {
      categories.temperature = temperatureCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load temperature unit configuration',
      };
    }

    // Load airflow configuration
    const airflowCategory = loadUnitCategory(airflowConfig, 'airflow');
    if (airflowCategory) {
      categories.airflow = airflowCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load airflow unit configuration',
      };
    }

    // Load airflow-envelope configuration
    const airflowEnvelopeCategory = loadUnitCategory(
      airflowEnvelopeConfig,
      'airflow-envelope'
    );
    if (airflowEnvelopeCategory) {
      categories['airflow-envelope'] = airflowEnvelopeCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load airflow-envelope unit configuration',
      };
    }

    // Load mass configuration
    const massCategory = loadUnitCategory(massConfig, 'mass');
    if (massCategory) {
      categories.mass = massCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load mass unit configuration',
      };
    }

    // Load energy configuration
    const energyCategory = loadUnitCategory(energyConfig, 'energy');
    if (energyCategory) {
      categories.energy = energyCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load energy unit configuration',
      };
    }

    // Load power configuration
    const powerCategory = loadUnitCategory(powerConfig, 'power');
    if (powerCategory) {
      categories.power = powerCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load power unit configuration',
      };
    }

    // Load power-intensity configuration
    const powerIntensityCategory = loadUnitCategory(
      powerIntensityConfig,
      'power-intensity'
    );
    if (powerIntensityCategory) {
      categories['power-intensity'] = powerIntensityCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load power-intensity unit configuration',
      };
    }

    // Load energy-intensity configuration
    const energyIntensityCategory = loadUnitCategory(
      energyIntensityConfig,
      'energy-intensity'
    );
    if (energyIntensityCategory) {
      categories['energy-intensity'] = energyIntensityCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load energy-intensity unit configuration',
      };
    }

    // Load energy-efficiency configuration
    const energyEfficiencyCategory = loadUnitCategory(
      energyEfficiencyConfig,
      'energy-efficiency'
    );
    if (energyEfficiencyCategory) {
      categories['energy-efficiency'] = energyEfficiencyCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load energy-efficiency unit configuration',
      };
    }

    // Load density configuration
    const densityCategory = loadUnitCategory(densityConfig, 'density');
    if (densityCategory) {
      categories['density'] = densityCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load density unit configuration',
      };
    }

    // Load speed configuration
    const speedCategory = loadUnitCategory(speedConfig, 'speed');
    if (speedCategory) {
      categories['speed'] = speedCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load speed unit configuration',
      };
    }

    // Load humidity configuration
    const humidityCategory = loadUnitCategory(humidityConfig, 'humidity');
    if (humidityCategory) {
      categories['humidity'] = humidityCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load humidity unit configuration',
      };
    }

    // Load heat-capacity-by-volume configuration
    const heatCapVolCategory = loadUnitCategory(
      heatCapacityByVolumeConfig,
      'heat-capacity-by-volume'
    );
    if (heatCapVolCategory) {
      categories['heat-capacity-by-volume'] = heatCapVolCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load heat-capacity-by-volume unit configuration',
      };
    }

    // Load heat-capacity-by-area configuration
    const heatCapAreaCategory = loadUnitCategory(
      heatCapacityByAreaConfig,
      'heat-capacity-by-area'
    );
    if (heatCapAreaCategory) {
      categories['heat-capacity-by-area'] = heatCapAreaCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load heat-capacity-by-area unit configuration',
      };
    }

    // Validate that we have at least one category
    if (Object.keys(categories).length === 0) {
      return {
        success: false,
        error: 'No valid unit configurations found',
      };
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `Successfully loaded ${Object.keys(categories).length} unit categories:`,
        Object.keys(categories)
      );
    }

    return {
      success: true,
      categories,
    };
  } catch (error) {
    console.error('Error loading configurations:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown configuration loading error',
    };
  }
}

/**
 * Gets all unit aliases from all loaded categories
 * Useful for fuzzy matching and suggestions
 */
export function getAllUnitAliases(
  categories: Record<string, UnitCategory>
): Record<string, { category: string; unit: string }> {
  const aliases: Record<string, { category: string; unit: string }> = {};

  Object.entries(categories).forEach(([categoryKey, category]) => {
    Object.entries(category.units).forEach(([unitKey, unit]) => {
      // Add all aliases for this unit
      unit.aliases.forEach((alias) => {
        if (!alias || typeof alias !== 'string') return;
        const normalizedAlias = alias.toLowerCase().trim();
        if (!normalizedAlias) return;

        const existing = aliases[normalizedAlias];
        if (!existing) {
          // First-seen mapping wins to keep deterministic behavior
          aliases[normalizedAlias] = {
            category: categoryKey,
            unit: unitKey,
          };
        } else if (
          existing.category !== categoryKey ||
          existing.unit !== unitKey
        ) {
          // Conflict across different units/categories — warn and keep first mapping
          console.warn(
            `Duplicate alias '${alias}' found in category ${categoryKey}, unit ${unitKey}`
          );
          // keep first mapping
        }
      });
    });
  });

  return aliases;
}

/**
 * Finds a unit by alias (case-insensitive)
 */
export function findUnitByAlias(
  alias: string,
  categories: Record<string, UnitCategory>
): { category: string; unit: string; definition: any } | null {
  const normalizedAlias = alias.toLowerCase().trim();

  for (const [categoryKey, category] of Object.entries(categories)) {
    for (const [unitKey, unit] of Object.entries(category.units)) {
      if (unit.aliases.some((a) => a.toLowerCase() === normalizedAlias)) {
        return {
          category: categoryKey,
          unit: unitKey,
          definition: unit,
        };
      }
    }
  }

  return null;
}

/**
 * Get conversion factor between two units (must be in same category)
 */
export function getConversionFactor(
  sourceUnit: string,
  targetUnit: string,
  category: UnitCategory
): number | null {
  const source = category.units[sourceUnit];
  const target = category.units[targetUnit];

  if (!source || !target) {
    return null;
  }

  // Convert source to base unit, then base unit to target
  // source_value * source_factor = base_value
  // base_value / target_factor = target_value
  // Therefore: target_value = source_value * (source_factor / target_factor)

  if (typeof source.factor !== 'number' || typeof target.factor !== 'number') {
    // One or both units use transforms instead of simple factors
    return null;
  }

  return source.factor / target.factor;
}
