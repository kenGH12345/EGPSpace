import {
  generateId,
  deepClone,
  isNonEmptyString,
  isValidTimeout,
  sleep
} from '../utils';

describe('Workflow Utils', () => {
  describe('generateId', () => {
    test('should generate id with default prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^id_\d+_[a-z0-9]+$/);
    });

    test('should generate id with custom prefix', () => {
      const id = generateId('exec');
      expect(id).toMatch(/^exec_\d+_[a-z0-9]+$/);
    });

    test('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('deepClone', () => {
    test('should deep clone an object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const clone = deepClone(obj);
      
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    test('should deep clone an array', () => {
      const arr = [1, [2, 3]];
      const clone = deepClone(arr);
      
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
      expect(clone[1]).not.toBe(arr[1]);
    });

    test('should handle null', () => {
      expect(deepClone(null)).toBeNull();
    });

    test('should handle undefined', () => {
      expect(deepClone(undefined)).toBeUndefined();
    });

    test('should handle primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
    });
  });

  describe('isNonEmptyString', () => {
    test('should return true for non-empty string', () => {
      expect(isNonEmptyString('hello')).toBe(true);
    });

    test('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    test('should return false for whitespace-only string', () => {
      expect(isNonEmptyString('   ')).toBe(false);
    });

    test('should return false for non-string types', () => {
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });
  });

  describe('isValidTimeout', () => {
    test('should return true for valid timeout', () => {
      expect(isValidTimeout(1000)).toBe(true);
      expect(isValidTimeout(30000)).toBe(true);
      expect(isValidTimeout(86400000)).toBe(true);
    });

    test('should return false for zero', () => {
      expect(isValidTimeout(0)).toBe(false);
    });

    test('should return false for negative', () => {
      expect(isValidTimeout(-1)).toBe(false);
    });

    test('should return false for exceeding 24 hours', () => {
      expect(isValidTimeout(86400001)).toBe(false);
    });

    test('should return false for Infinity', () => {
      expect(isValidTimeout(Infinity)).toBe(false);
    });

    test('should return false for NaN', () => {
      expect(isValidTimeout(NaN)).toBe(false);
    });
  });

  describe('sleep', () => {
    test('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });

    test('should resolve immediately for 0ms', async () => {
      const start = Date.now();
      await sleep(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });
});