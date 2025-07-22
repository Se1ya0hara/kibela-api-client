import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

// Load .env file from current directory
dotenv.config();

const CONFIG_DIR = path.join(os.homedir(), '.kibela');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface CliConfig {
  team?: string;
  token?: string;
}

export class ConfigManager {
  static ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  static load(): CliConfig {
    this.ensureConfigDir();
    
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        console.error('Error reading config file:', error);
        return {};
      }
    }
    
    return {};
  }

  static save(config: CliConfig): void {
    this.ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  static get(key: keyof CliConfig): string | undefined {
    // Priority order:
    // 1. Config file (~/.kibela/config.json)
    // 2. Environment variables (KIBELA_TEAM, KIBELA_API_KEY)
    // 3. .env file (KIBELA_TEAM, KIBELA_API_KEY)
    
    const config = this.load();
    if (config[key]) {
      return config[key];
    }

    // Special handling for 'token' to support both KIBELA_TOKEN and KIBELA_API_KEY
    if (key === 'token') {
      return process.env.KIBELA_TOKEN || process.env.KIBELA_API_KEY;
    }
    
    return process.env[`KIBELA_${key.toUpperCase()}`];
  }

  static set(key: keyof CliConfig, value: string): void {
    const config = this.load();
    config[key] = value;
    this.save(config);
  }

  static delete(key: keyof CliConfig): void {
    const config = this.load();
    delete config[key];
    this.save(config);
  }

  static clear(): void {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  }

  static getConfigSource(): { team?: string; token?: string; source: string } {
    const config = this.load();
    const result: { team?: string; token?: string; source: string } = { source: 'none' };

    // Check for team
    if (config.team) {
      result.team = 'config file';
    } else if (process.env.KIBELA_TEAM) {
      result.team = '.env/environment';
    }

    // Check for token
    if (config.token) {
      result.token = 'config file';
    } else if (process.env.KIBELA_TOKEN || process.env.KIBELA_API_KEY) {
      result.token = '.env/environment';
    }

    if (result.team || result.token) {
      result.source = 'mixed';
    }

    return result;
  }
}