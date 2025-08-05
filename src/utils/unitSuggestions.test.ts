import {
  getUnitSuggestions,
  findPartialMatches,
  getTargetUnitSuggestions,
} from './unitSuggestions';

describe('Unit Suggestions', () => {
  describe('getUnitSuggestions', () => {
    test('returns matching units for partial input', () => {
      const suggestions = getUnitSuggestions('m');

      expect(suggestions).toContain('meter');
      expect(suggestions).toContain('millimeter');
      expect(suggestions).toContain('mile');
      expect(suggestions).not.toContain('foot');
    });

    test('returns exact match first', () => {
      const suggestions = getUnitSuggestions('meter');

      expect(suggestions[0]).toBe('meter');
    });

    test('handles case insensitive matching', () => {
      const suggestions = getUnitSuggestions('M');

      expect(suggestions).toContain('meter');
      expect(suggestions).toContain('mile');
    });

    test('handles abbreviations', () => {
      const suggestions = getUnitSuggestions('ft');

      expect(suggestions).toContain('foot');
    });

    test('returns empty array for no matches', () => {
      const suggestions = getUnitSuggestions('xyz');

      expect(suggestions).toEqual([]);
    });

    test('handles plural forms', () => {
      const suggestions = getUnitSuggestions('meters');

      expect(suggestions).toContain('meter');
    });
  });

  describe('findPartialMatches', () => {
    test('finds matches at start of word', () => {
      const matches = findPartialMatches('me', ['meter', 'foot', 'centimeter']);

      expect(matches).toContain('meter');
      expect(matches).not.toContain('foot');
      expect(matches).toContain('centimeter'); // contains 'me'
    });

    test('prioritizes exact prefix matches', () => {
      const matches = findPartialMatches('met', ['meter', 'centimeter', 'met']);

      expect(matches[0]).toBe('met'); // exact match first
      expect(matches[1]).toBe('meter'); // then prefix match
    });
  });

  describe('getTargetUnitSuggestions', () => {
    test('returns compatible target units for length source', () => {
      const suggestions = getTargetUnitSuggestions('meter');

      expect(suggestions).toContain('foot');
      expect(suggestions).toContain('inch');
      expect(suggestions).toContain('kilometer');
      expect(suggestions).not.toContain('kilogram'); // different category
    });

    test('excludes the source unit from suggestions', () => {
      const suggestions = getTargetUnitSuggestions('meter');

      expect(suggestions).not.toContain('meter');
    });

    test('returns empty array for unknown unit', () => {
      const suggestions = getTargetUnitSuggestions('unknown');

      expect(suggestions).toEqual([]);
    });

    test('prioritizes common conversions', () => {
      const suggestions = getTargetUnitSuggestions('meter');

      // Common metric to imperial conversions should be early
      const topSuggestions = suggestions.slice(0, 3);
      expect(topSuggestions).toContain('foot');
    });
  });
});
