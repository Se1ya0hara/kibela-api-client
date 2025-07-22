import { ConfigSchema } from '../cli/_validators';

describe('ConfigSchema', () => {
  it('should validate correct config', () => {
    const config = {
      token: 'test-token',
      team: 'test-team'
    };

    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should fail with empty token', () => {
    const config = {
      token: '',
      team: 'test-team'
    };

    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should fail with empty team', () => {
    const config = {
      token: 'test-token',
      team: ''
    };

    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should fail with missing fields', () => {
    const config = {
      token: 'test-token'
    };

    const result = ConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});