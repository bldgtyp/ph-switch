// Test file to verify our minimal dependencies work correctly
import debounce from 'lodash.debounce';
import Ajv from 'ajv';

// Test debounce function
export const testDebounce = () => {
  const debouncedFunction = debounce(() => {
    console.log('Debounced function called');
  }, 300);
  
  return typeof debouncedFunction === 'function';
};

// Test AJV JSON schema validation
export const testAjv = () => {
  const ajv = new Ajv();
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      value: { type: 'number' }
    },
    required: ['name', 'value']
  };
  
  const validate = ajv.compile(schema);
  const valid = validate({ name: 'test', value: 123 });
  
  return valid;
};

// Test native clipboard API availability
export const testClipboardAPI = () => {
  return typeof navigator !== 'undefined' && 
         typeof navigator.clipboard !== 'undefined' &&
         typeof navigator.clipboard.writeText === 'function';
};

// Test native number formatting
export const testNumberFormatting = () => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
  
  const result = formatter.format(1234.567);
  return result === '1,234.567';
};
