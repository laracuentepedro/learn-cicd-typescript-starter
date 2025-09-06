import { expect, test, describe } from 'vitest';
import { getAPIKey } from 'src/api/auth';
import { IncomingHttpHeaders } from 'http';

describe('getAPIKey', () => {
  test('returns API key when valid authorization header is provided', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'ApiKey abc123def456'
    };

    const result = getAPIKey(headers);

    expect(result).toBe('abc123def456');
  });

  test('returns null when no authorization header is provided', () => {
    const headers: IncomingHttpHeaders = {};

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('returns null when authorization header is undefined', () => {
    const headers: IncomingHttpHeaders = {
      authorization: undefined
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('returns null when authorization header does not start with "ApiKey"', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'Bearer abc123def456'
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('returns null when authorization header has incorrect format (missing key)', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'ApiKey'
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('returns empty string when authorization header is just "ApiKey " with space but no key', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'ApiKey '
    };

    const result = getAPIKey(headers);

    // Current implementation returns empty string, not null, due to split behavior
    expect(result).toBe('');
  });

  test('returns empty string when authorization header has extra spaces (current implementation behavior)', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'ApiKey   xyz789abc123'
    };

    const result = getAPIKey(headers);

    // Current implementation returns empty string because split(' ') creates empty strings for consecutive spaces
    // splitAuth[1] is an empty string, not 'xyz789abc123'
    expect(result).toBe('');
  });

  test('returns first part of API key when multiple spaces separate parts', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'ApiKey key123 extra456'
    };

    const result = getAPIKey(headers);

    expect(result).toBe('key123');
  });

  test('throws error when authorization header is string array (current implementation bug)', () => {
    const headers: IncomingHttpHeaders = {
      authorization: ['ApiKey test123', 'ApiKey test456'] as any // Type assertion to bypass TS error
    };

    // Current implementation will throw because it calls .split() on an array
    expect(() => getAPIKey(headers)).toThrow();
  });

  test('throws error when authorization header is empty array (current implementation bug)', () => {
    const headers: IncomingHttpHeaders = {
      authorization: [] as any // Type assertion to bypass TS error
    };

    // Current implementation will throw because it calls .split() on an array
    expect(() => getAPIKey(headers)).toThrow();
  });

  test('handles case-sensitive "ApiKey" prefix correctly', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'apikey test123'
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('handles empty string authorization header', () => {
    const headers: IncomingHttpHeaders = {
      authorization: ''
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('handles authorization header with only spaces', () => {
    const headers: IncomingHttpHeaders = {
      authorization: '   '
    };

    const result = getAPIKey(headers);

    expect(result).toBeNull();
  });

  test('handles authorization header with different casing variations', () => {
    const testCases = [
      { auth: 'APIKEY test123', expected: null },
      { auth: 'ApiKEY test123', expected: null },
      { auth: 'apiKey test123', expected: null },
      { auth: 'Apikey test123', expected: null }
    ];

    testCases.forEach(({ auth, expected }) => {
      const headers: IncomingHttpHeaders = { authorization: auth };
      const result = getAPIKey(headers);
      expect(result).toBe(expected);
    });
  });

  test('handles very long API keys', () => {
    const longApiKey = 'a'.repeat(1000);
    const headers: IncomingHttpHeaders = {
      authorization: `ApiKey ${longApiKey}`
    };

    const result = getAPIKey(headers);

    expect(result).toBe(longApiKey);
  });

  test('handles API key with special characters', () => {
    const specialApiKey = 'abc123-def456_ghi789.jkl012';
    const headers: IncomingHttpHeaders = {
      authorization: `ApiKey ${specialApiKey}`
    };

    const result = getAPIKey(headers);

    expect(result).toBe(specialApiKey);
  });
});