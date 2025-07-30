import { ConfigManager } from '../cli/config';
import { KibelaError } from '../cli/_error-handler';

describe('ConfigManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Clear config file before each test
    ConfigManager.clear();
  });

  afterAll(() => {
    process.env = originalEnv;
    ConfigManager.clear();
  });

  it('should load config from environment variables', () => {
    process.env.KIBELA_TOKEN = 'test-key';
    process.env.KIBELA_TEAM = 'test-team';

    expect(ConfigManager.get('token')).toBe('test-key');
    expect(ConfigManager.get('team')).toBe('test-team');
  });

  it('should prioritize config file over environment variables', () => {
    process.env.KIBELA_TOKEN = 'env-key';
    process.env.KIBELA_TEAM = 'env-team';

    ConfigManager.set('token', 'config-key');
    ConfigManager.set('team', 'config-team');

    expect(ConfigManager.get('token')).toBe('config-key');
    expect(ConfigManager.get('team')).toBe('config-team');
  });

  it('should support KIBELA_TOKEN', () => {
    process.env.KIBELA_TOKEN = 'token-value';
    expect(ConfigManager.get('token')).toBe('token-value');
  });

  it('should return undefined when config is not set', () => {
    delete process.env.KIBELA_TOKEN;
    delete process.env.KIBELA_TEAM;
    delete process.env.KIBELA_TOKEN;

    expect(ConfigManager.get('token')).toBeUndefined();
    expect(ConfigManager.get('team')).toBeUndefined();
  });

  it('should save and load config correctly', () => {
    ConfigManager.set('token', 'saved-token');
    ConfigManager.set('team', 'saved-team');

    const config = ConfigManager.load();
    expect(config.token).toBe('saved-token');
    expect(config.team).toBe('saved-team');
  });

  it('should delete config values', () => {
    ConfigManager.set('token', 'some-token');
    ConfigManager.set('team', 'some-team');

    ConfigManager.delete('token');
    const config = ConfigManager.load();
    
    expect(config.token).toBeUndefined();
    expect(config.team).toBe('some-team');
  });

  it('should get config source correctly', () => {
    // Test environment source
    process.env.KIBELA_TOKEN = 'env-key';
    process.env.KIBELA_TEAM = 'env-team';
    let source = ConfigManager.getConfigSource();
    expect(source.team).toBe('.env/environment');
    expect(source.token).toBe('.env/environment');

    // Test config file source
    ConfigManager.set('token', 'config-token');
    source = ConfigManager.getConfigSource();
    expect(source.token).toBe('config file');
    expect(source.team).toBe('.env/environment');
    expect(source.source).toBe('mixed');
  });
});