// Local storage utility for conversion history management
import type { ConversionHistory, ValidationResult } from '../types';

// Storage configuration
const STORAGE_KEY = 'ph-unit-converter-history';
const MAX_HISTORY_ENTRIES = 100;
const STORAGE_VERSION = '1.0';

// Storage quota management (5MB typical localStorage limit)
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB to leave buffer

/**
 * Extended conversion history with additional metadata
 */
interface StoredConversionHistory extends ConversionHistory {
  version: string;
  category: string;
  precision: number;
  formattedResult: string;
}

/**
 * Storage container with metadata
 */
interface StorageContainer {
  version: string;
  lastModified: number;
  entries: StoredConversionHistory[];
  totalSize: number;
}

/**
 * Result of storage operations
 */
interface StorageResult {
  success: boolean;
  data?: StorageContainer;
  error?: string;
  entriesRemoved?: number;
}

/**
 * Validates conversion history entry structure
 */
function validateHistoryEntry(entry: any): ValidationResult {
  const errors: string[] = [];

  if (!entry || typeof entry !== 'object') {
    errors.push('Entry must be an object');
    return { valid: false, errors };
  }

  // Required fields
  const requiredFields = [
    'id',
    'timestamp',
    'input',
    'output',
    'sourceUnit',
    'targetUnit',
    'value',
    'result',
  ];
  for (const field of requiredFields) {
    if (!(field in entry)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type validations
  if (typeof entry.id !== 'string' || entry.id.length === 0) {
    errors.push('ID must be a non-empty string');
  }

  if (typeof entry.timestamp !== 'number' || entry.timestamp <= 0) {
    errors.push('Timestamp must be a positive number');
  }

  if (typeof entry.input !== 'string' || entry.input.length === 0) {
    errors.push('Input must be a non-empty string');
  }

  if (typeof entry.output !== 'string' || entry.output.length === 0) {
    errors.push('Output must be a non-empty string');
  }

  if (typeof entry.sourceUnit !== 'string' || entry.sourceUnit.length === 0) {
    errors.push('Source unit must be a non-empty string');
  }

  if (typeof entry.targetUnit !== 'string' || entry.targetUnit.length === 0) {
    errors.push('Target unit must be a non-empty string');
  }

  if (typeof entry.value !== 'number' || !isFinite(entry.value)) {
    errors.push('Value must be a finite number');
  }

  if (typeof entry.result !== 'number' || !isFinite(entry.result)) {
    errors.push('Result must be a finite number');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Calculates the approximate size of data in bytes
 */
function calculateStorageSize(data: any): number {
  try {
    return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
  } catch (error) {
    return 0;
  }
}

/**
 * Generates a unique ID for conversion history entries
 */
function generateEntryId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `conv_${timestamp}_${random}`;
}

/**
 * Creates a default storage container
 */
function createDefaultContainer(): StorageContainer {
  return {
    version: STORAGE_VERSION,
    lastModified: Date.now(),
    entries: [],
    totalSize: 0,
  };
}

/**
 * Loads data from localStorage with error handling
 */
function loadFromStorage(): StorageResult {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        success: true,
        data: createDefaultContainer(),
      };
    }

    const parsed = JSON.parse(stored);

    // Validate storage structure
    if (!parsed || typeof parsed !== 'object') {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Invalid storage data structure, resetting');
      }
      return {
        success: true,
        data: createDefaultContainer(),
      };
    }

    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `Storage version mismatch (${parsed.version} vs ${STORAGE_VERSION}), resetting`
        );
      }
      return {
        success: true,
        data: createDefaultContainer(),
      };
    }

    // Ensure required fields exist
    const container: StorageContainer = {
      version: parsed.version || STORAGE_VERSION,
      lastModified: parsed.lastModified || Date.now(),
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      totalSize: parsed.totalSize || 0,
    };

    return {
      success: true,
      data: container,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to load from storage:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
      data: createDefaultContainer(),
    };
  }
}

/**
 * Saves data to localStorage with error handling
 */
function saveToStorage(container: StorageContainer): StorageResult {
  try {
    // Update metadata
    container.lastModified = Date.now();
    container.totalSize = calculateStorageSize(container);

    // Check storage size limits
    if (container.totalSize > MAX_STORAGE_SIZE) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Storage size exceeds limit, cleaning up old entries');
      }
      const cleaned = cleanupOldEntries(container, MAX_STORAGE_SIZE * 0.8); // Clean to 80% of limit
      return saveToStorage(cleaned.data!);
    }

    const serialized = JSON.stringify(container);
    localStorage.setItem(STORAGE_KEY, serialized);

    return {
      success: true,
      data: container,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to save to storage:', error);
    }

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const loadResult = loadFromStorage();
      if (loadResult.success && loadResult.data) {
        const cleaned = cleanupOldEntries(
          loadResult.data,
          MAX_STORAGE_SIZE * 0.5
        );
        if (cleaned.success && cleaned.data) {
          // Try to save the cleaned data without recursion
          try {
            const cleanedSerialized = JSON.stringify(cleaned.data);
            localStorage.setItem(STORAGE_KEY, cleanedSerialized);
            return {
              success: true,
              data: cleaned.data,
              entriesRemoved: cleaned.entriesRemoved,
            };
          } catch (secondError) {
            // If it still fails, give up and return error
            return {
              success: false,
              error: 'Storage quota exceeded and cleanup failed',
            };
          }
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}

/**
 * Removes oldest entries to reduce storage size
 */
function cleanupOldEntries(
  container: StorageContainer,
  targetSize: number
): StorageResult {
  const sortedEntries = [...container.entries].sort(
    (a, b) => a.timestamp - b.timestamp
  );
  const keptEntries: StoredConversionHistory[] = [];
  let currentSize = 0;

  // Keep newest entries within size limit
  for (let i = sortedEntries.length - 1; i >= 0; i--) {
    const entry = sortedEntries[i];
    const entrySize = calculateStorageSize(entry);

    if (
      currentSize + entrySize <= targetSize &&
      keptEntries.length < MAX_HISTORY_ENTRIES
    ) {
      keptEntries.unshift(entry);
      currentSize += entrySize;
    }
  }

  const newContainer: StorageContainer = {
    ...container,
    entries: keptEntries,
    totalSize: currentSize,
  };

  return {
    success: true,
    data: newContainer,
    entriesRemoved: container.entries.length - keptEntries.length,
  };
}

/**
 * Adds a conversion to the history
 */
export function saveConversion(
  input: string,
  output: string,
  sourceUnit: string,
  targetUnit: string,
  value: number,
  result: number,
  category: string = 'length',
  formattedResult: string = output
): StorageResult {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return loadResult;
  }

  const container = loadResult.data;

  // Create new history entry
  const entry: StoredConversionHistory = {
    id: generateEntryId(),
    timestamp: Date.now(),
    input: input.trim(),
    output: output.trim(),
    sourceUnit: sourceUnit.trim(),
    targetUnit: targetUnit.trim(),
    value,
    result,
    version: STORAGE_VERSION,
    category,
    precision: 6, // Default precision
    formattedResult,
  };

  // Validate entry
  const validation = validateHistoryEntry(entry);
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid history entry: ${validation.errors?.join(', ')}`,
    };
  }

  // Add entry to beginning of array (newest first)
  container.entries.unshift(entry);

  // Enforce max entries limit
  if (container.entries.length > MAX_HISTORY_ENTRIES) {
    container.entries = container.entries.slice(0, MAX_HISTORY_ENTRIES);
  }

  // Save updated container
  return saveToStorage(container);
}

/**
 * Retrieves conversion history
 */
export function getConversionHistory(limit?: number): StorageResult {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return loadResult;
  }

  const container = loadResult.data;

  // Apply limit if specified
  if (limit && limit > 0) {
    container.entries = container.entries.slice(0, limit);
  }

  return {
    success: true,
    data: container,
  };
}

/**
 * Searches conversion history
 */
export function searchHistory(
  query: string,
  limit: number = 20
): StorageResult {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return loadResult;
  }

  const container = loadResult.data;
  const queryLower = query.toLowerCase().trim();

  if (queryLower === '') {
    return getConversionHistory(limit);
  }

  // Search in input, output, and units
  const filteredEntries = container.entries
    .filter(
      (entry) =>
        entry.input.toLowerCase().includes(queryLower) ||
        entry.output.toLowerCase().includes(queryLower) ||
        entry.sourceUnit.toLowerCase().includes(queryLower) ||
        entry.targetUnit.toLowerCase().includes(queryLower)
    )
    .slice(0, limit);

  return {
    success: true,
    data: {
      ...container,
      entries: filteredEntries,
    },
  };
}

/**
 * Removes a specific conversion from history
 */
export function removeConversion(id: string): StorageResult {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return loadResult;
  }

  const container = loadResult.data;
  const originalLength = container.entries.length;

  container.entries = container.entries.filter((entry) => entry.id !== id);

  if (container.entries.length === originalLength) {
    return {
      success: false,
      error: `Conversion with ID ${id} not found`,
    };
  }

  return saveToStorage(container);
}

/**
 * Clears all conversion history
 */
export function clearAllHistory(): StorageResult {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      data: createDefaultContainer(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear history',
    };
  }
}

/**
 * Exports history as JSON
 */
export function exportHistory(): {
  success: boolean;
  data?: string;
  error?: string;
} {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return {
      success: false,
      error: loadResult.error || 'Failed to load history',
    };
  }

  try {
    const exportData = {
      exported: new Date().toISOString(),
      version: STORAGE_VERSION,
      entries: loadResult.data.entries,
    };

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to export history',
    };
  }
}

/**
 * Gets storage statistics
 */
export function getStorageStats(): {
  totalEntries: number;
  totalSize: number;
  oldestEntry?: number;
  newestEntry?: number;
  version: string;
} {
  const loadResult = loadFromStorage();
  if (!loadResult.success || !loadResult.data) {
    return {
      totalEntries: 0,
      totalSize: 0,
      version: STORAGE_VERSION,
    };
  }

  const container = loadResult.data;
  const timestamps = container.entries.map((e) => e.timestamp);

  return {
    totalEntries: container.entries.length,
    // Use stored totalSize when present (including 0). Only calculate size if undefined.
    totalSize:
      typeof container.totalSize === 'number'
        ? container.totalSize
        : calculateStorageSize(container),
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    version: container.version,
  };
}

/**
 * Validates storage system functionality
 */
export function validateStorage(): ValidationResult {
  try {
    // Test write capability
    const testKey = `${STORAGE_KEY}_test`;
    const testData = { test: true, timestamp: Date.now() };

    localStorage.setItem(testKey, JSON.stringify(testData));
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    if (!retrieved) {
      return {
        valid: false,
        errors: ['localStorage write/read test failed'],
      };
    }

    const parsed = JSON.parse(retrieved);
    if (parsed.test !== true) {
      return {
        valid: false,
        errors: ['localStorage data integrity test failed'],
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [
        error instanceof Error ? error.message : 'Storage validation failed',
      ],
    };
  }
}
