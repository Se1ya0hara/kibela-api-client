import { ConfigSchema, validateConfig } from '../cli/_validators';
import { Validator } from '../core/validation/validator';

describe('ConfigSchema', () => {
  it('should validate correct config', () => {
    const config = {
      token: 'test-token',
      team: 'test-team'
    };

    const errors = Validator.validate(config, ConfigSchema);
    expect(errors.length).toBe(0);
  });

  it('should fail with empty token', () => {
    const config = {
      token: '',
      team: 'test-team'
    };

    const errors = Validator.validate(config, ConfigSchema);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('required');
  });

  it('should fail with empty team', () => {
    const config = {
      token: 'test-token',
      team: ''
    };

    const errors = Validator.validate(config, ConfigSchema);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('required');
  });

  it('should fail with missing fields', () => {
    const config = {
      token: 'test-token'
    };

    const errors = Validator.validate(config, ConfigSchema);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('validateConfig', () => {
  it('should return isValid true for valid config', () => {
    const result = validateConfig('test-team', 'test-token');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return isValid false for invalid config', () => {
    const result = validateConfig('', 'test-token');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});