// Unit tests for local storage functionality
import {
  saveConversion,
  getConversionHistory,
  searchHistory,
  removeConversion,
  clearAllHistory,
  exportHistory,
  getStorageStats,
  validateStorage,
} from './storage';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Replace global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('validateStorage', () => {
    it('should validate storage functionality', () => {
      const validation = validateStorage();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });
  });

  describe('saveConversion', () => {
    it('should save a valid conversion', () => {
      const result = saveConversion(
        '1 meter to feet',
        '3.281 feet',
        'meter',
        'foot',
        1,
        3.281
      );

      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(1);
      expect(result.data?.entries[0].input).toBe('1 meter to feet');
      expect(result.data?.entries[0].output).toBe('3.281 feet');
    });

    it('should generate unique IDs for each conversion', () => {
      const result1 = saveConversion(
        '1 m to ft',
        '3.281 ft',
        'meter',
        'foot',
        1,
        3.281
      );
      const result2 = saveConversion(
        '2 m to ft',
        '6.562 ft',
        'meter',
        'foot',
        2,
        6.562
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const history = getConversionHistory();
      expect(history.data?.entries).toHaveLength(2);
      expect(history.data?.entries[0].id).not.toBe(history.data?.entries[1].id);
    });

    it('should maintain chronological order (newest first)', () => {
      const time1 = Date.now();
      const result1 = saveConversion(
        '1 m to ft',
        '3.281 ft',
        'meter',
        'foot',
        1,
        3.281
      );

      // Wait a small amount to ensure different timestamps
      setTimeout(() => {
        const result2 = saveConversion(
          '2 m to ft',
          '6.562 ft',
          'meter',
          'foot',
          2,
          6.562
        );

        const history = getConversionHistory();
        expect(history.data?.entries).toHaveLength(2);
        expect(history.data?.entries[0].timestamp).toBeGreaterThan(
          history.data?.entries[1].timestamp!
        );
      }, 10);
    });

    it('should handle empty or whitespace-only inputs', () => {
      const result = saveConversion(
        '  1 meter to feet  ',
        '  3.281 feet  ',
        '  meter  ',
        '  foot  ',
        1,
        3.281
      );

      expect(result.success).toBe(true);
      expect(result.data?.entries[0].input).toBe('1 meter to feet');
      expect(result.data?.entries[0].output).toBe('3.281 feet');
      expect(result.data?.entries[0].sourceUnit).toBe('meter');
      expect(result.data?.entries[0].targetUnit).toBe('foot');
    });

    it('should include additional metadata', () => {
      const result = saveConversion(
        '1 meter to feet',
        '3.281 feet',
        'meter',
        'foot',
        1,
        3.281,
        'length',
        '3.281'
      );

      expect(result.success).toBe(true);
      const entry = result.data?.entries[0];
      expect(entry?.category).toBe('length');
      expect(entry?.formattedResult).toBe('3.281');
      expect(entry?.version).toBeDefined();
      expect(entry?.timestamp).toBeDefined();
    });

    it('should enforce maximum entries limit', () => {
      // Save more than MAX_HISTORY_ENTRIES (100) conversions
      for (let i = 0; i < 105; i++) {
        saveConversion(
          `${i} meter to feet`,
          `${i * 3.281} feet`,
          'meter',
          'foot',
          i,
          i * 3.281
        );
      }

      const history = getConversionHistory();
      expect(history.data?.entries.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getConversionHistory', () => {
    beforeEach(() => {
      // Add some test data
      saveConversion('1 m to ft', '3.281 ft', 'meter', 'foot', 1, 3.281);
      saveConversion('2 m to ft', '6.562 ft', 'meter', 'foot', 2, 6.562);
      saveConversion('1 ft to in', '12 in', 'foot', 'inch', 1, 12);
    });

    it('should retrieve all conversions by default', () => {
      const result = getConversionHistory();
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(3);
    });

    it('should respect limit parameter', () => {
      const result = getConversionHistory(2);
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(2);
    });

    it('should return empty array for new storage', () => {
      localStorageMock.clear();
      const result = getConversionHistory();
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(0);
    });

    it('should handle corrupted storage gracefully', () => {
      localStorageMock.setItem('ph-unit-converter-history', 'invalid json');
      const result = getConversionHistory();
      expect(result.success).toBe(false);
      expect(result.data?.entries).toHaveLength(0);
    });
  });

  describe('searchHistory', () => {
    beforeEach(() => {
      saveConversion(
        '1 meter to feet',
        '3.281 feet',
        'meter',
        'foot',
        1,
        3.281
      );
      saveConversion(
        '2 centimeters to inches',
        '0.787 inches',
        'centimeter',
        'inch',
        2,
        0.787
      );
      saveConversion(
        '5 feet to meters',
        '1.524 meters',
        'foot',
        'meter',
        5,
        1.524
      );
    });

    it('should search in input text', () => {
      const result = searchHistory('meter');
      expect(result.success).toBe(true);
      expect(result.data?.entries.length).toBeGreaterThanOrEqual(1); // Should find at least "meter to feet" or "feet to meters"

      // More specific test
      const meterResult = searchHistory('meter to feet');
      expect(meterResult.success).toBe(true);
      expect(meterResult.data?.entries).toHaveLength(1);
    });

    it('should search in output text', () => {
      const result = searchHistory('inches');
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(1); // "centimeters to inches"
    });

    it('should search in unit names', () => {
      const result = searchHistory('foot');
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(2); // conversions involving feet
    });

    it('should be case insensitive', () => {
      const result = searchHistory('METER');
      expect(result.success).toBe(true);
      expect(result.data?.entries.length).toBeGreaterThan(0);
    });

    it('should return all entries for empty query', () => {
      const result = searchHistory('');
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(3);
    });

    it('should respect limit parameter', () => {
      const result = searchHistory('', 2);
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const result = searchHistory('nonexistent');
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(0);
    });
  });

  describe('removeConversion', () => {
    let conversionId: string;

    beforeEach(() => {
      const result = saveConversion(
        '1 m to ft',
        '3.281 ft',
        'meter',
        'foot',
        1,
        3.281
      );
      conversionId = result.data?.entries[0].id!;
      saveConversion('2 m to ft', '6.562 ft', 'meter', 'foot', 2, 6.562);
    });

    it('should remove existing conversion', () => {
      const result = removeConversion(conversionId);
      expect(result.success).toBe(true);

      const history = getConversionHistory();
      expect(history.data?.entries).toHaveLength(1);
      expect(history.data?.entries[0].input).toBe('2 m to ft');
    });

    it('should return error for non-existent ID', () => {
      const result = removeConversion('nonexistent-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not affect other conversions', () => {
      const historyBefore = getConversionHistory();
      const otherEntry = historyBefore.data?.entries.find(
        (e) => e.id !== conversionId
      );

      removeConversion(conversionId);

      const historyAfter = getConversionHistory();
      expect(historyAfter.data?.entries).toHaveLength(1);
      expect(historyAfter.data?.entries[0].id).toBe(otherEntry?.id);
    });
  });

  describe('clearAllHistory', () => {
    beforeEach(() => {
      saveConversion('1 m to ft', '3.281 ft', 'meter', 'foot', 1, 3.281);
      saveConversion('2 m to ft', '6.562 ft', 'meter', 'foot', 2, 6.562);
    });

    it('should remove all history', () => {
      const result = clearAllHistory();
      expect(result.success).toBe(true);

      const history = getConversionHistory();
      expect(history.data?.entries).toHaveLength(0);
    });

    it('should reset storage container', () => {
      clearAllHistory();
      const history = getConversionHistory();
      expect(history.data?.version).toBeDefined();
      expect(history.data?.lastModified).toBeDefined();
      expect(history.data?.totalSize).toBe(0);
    });
  });

  describe('exportHistory', () => {
    beforeEach(() => {
      saveConversion('1 m to ft', '3.281 ft', 'meter', 'foot', 1, 3.281);
      saveConversion('2 m to ft', '6.562 ft', 'meter', 'foot', 2, 6.562);
    });

    it('should export history as JSON', () => {
      const result = exportHistory();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const parsed = JSON.parse(result.data!);
      expect(parsed.entries).toHaveLength(2);
      expect(parsed.version).toBeDefined();
      expect(parsed.exported).toBeDefined();
    });

    it('should include all entry data', () => {
      const result = exportHistory();
      const parsed = JSON.parse(result.data!);

      const entry = parsed.entries[0];
      expect(entry.id).toBeDefined();
      expect(entry.input).toBeDefined();
      expect(entry.output).toBeDefined();
      expect(entry.sourceUnit).toBeDefined();
      expect(entry.targetUnit).toBeDefined();
      expect(entry.value).toBeDefined();
      expect(entry.result).toBeDefined();
      expect(entry.timestamp).toBeDefined();
    });

    it('should handle empty history', () => {
      clearAllHistory();
      const result = exportHistory();
      expect(result.success).toBe(true);

      const parsed = JSON.parse(result.data!);
      expect(parsed.entries).toHaveLength(0);
    });
  });

  describe('getStorageStats', () => {
    it('should return stats for empty storage', () => {
      // Ensure storage is empty before measuring stats
      // Use public API to clear so STORAGE_KEY is removed
      clearAllHistory();

      const stats = getStorageStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.version).toBeDefined();
      expect(stats.oldestEntry).toBeUndefined();
      expect(stats.newestEntry).toBeUndefined();
    });

    it('should return accurate stats with data', () => {
      const time1 = Date.now();
      saveConversion('1 m to ft', '3.281 ft', 'meter', 'foot', 1, 3.281);

      setTimeout(() => {
        const time2 = Date.now();
        saveConversion('2 m to ft', '6.562 ft', 'meter', 'foot', 2, 6.562);

        const stats = getStorageStats();
        expect(stats.totalEntries).toBe(2);
        expect(stats.totalSize).toBeGreaterThan(0);
        expect(stats.oldestEntry).toBeLessThan(stats.newestEntry!);
        expect(stats.oldestEntry).toBeGreaterThanOrEqual(time1);
        expect(stats.newestEntry).toBeGreaterThanOrEqual(time2);
      }, 10);
    });

    it('should calculate storage size', () => {
      saveConversion('test', 'test', 'meter', 'foot', 1, 1);
      const stats = getStorageStats();
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = (key: string, value: string) => {
        if (key === 'ph-unit-converter-history') {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        }
        return originalSetItem(key, value);
      };

      const result = saveConversion('test', 'test', 'meter', 'foot', 1, 1);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage quota exceeded');

      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });

    it('should handle invalid entry data', () => {
      // Try to save with invalid data types
      const result = saveConversion(
        '', // empty input
        '', // empty output
        '', // empty source unit
        '', // empty target unit
        NaN, // invalid value
        Infinity // invalid result
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid history entry');
    });

    it('should handle storage corruption gracefully', () => {
      // Reset any previous mocks
      localStorageMock.clear();

      // Corrupt the storage
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = (key: string) => {
        if (key === 'ph-unit-converter-history') {
          return '{"invalid": json}';
        }
        return originalGetItem(key);
      };

      const result = getConversionHistory();
      expect(result.success).toBe(false);
      expect(result.data?.entries).toHaveLength(0);

      // Restore original method
      localStorageMock.getItem = originalGetItem;
    });

    it('should handle version mismatches', () => {
      // Reset any previous mocks
      localStorageMock.clear();

      // Set up storage with wrong version
      const oldData = {
        version: '0.1',
        entries: [{ id: 'test', input: 'test' }],
        lastModified: Date.now(),
      };
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = (key: string) => {
        if (key === 'ph-unit-converter-history') {
          return JSON.stringify(oldData);
        }
        return originalGetItem(key);
      };

      const result = getConversionHistory();
      expect(result.success).toBe(true);
      expect(result.data?.entries).toHaveLength(0); // Should reset

      // Restore original method
      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('Storage Limits and Cleanup', () => {
    it('should enforce entry limits', () => {
      // Add many entries
      for (let i = 0; i < 105; i++) {
        saveConversion(
          `${i} m to ft`,
          `${i * 3.281} ft`,
          'meter',
          'foot',
          i,
          i * 3.281
        );
      }

      const history = getConversionHistory();
      expect(history.data?.entries.length).toBeLessThanOrEqual(100);
    });

    it('should remove oldest entries during cleanup', () => {
      // Add entries with known timestamps
      for (let i = 0; i < 10; i++) {
        saveConversion(
          `${i} m to ft`,
          `${i * 3.281} ft`,
          'meter',
          'foot',
          i,
          i * 3.281
        );
      }

      const historyFull = getConversionHistory();
      const oldestId =
        historyFull.data?.entries[historyFull.data.entries.length - 1].id;

      // Add more entries to trigger cleanup
      for (let i = 10; i < 105; i++) {
        saveConversion(
          `${i} m to ft`,
          `${i * 3.281} ft`,
          'meter',
          'foot',
          i,
          i * 3.281
        );
      }

      const historyAfter = getConversionHistory();
      const remainingIds = historyAfter.data?.entries.map((e) => e.id) || [];
      expect(remainingIds).not.toContain(oldestId);
    });
  });
});
