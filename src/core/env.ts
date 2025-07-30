import * as fs from 'fs';
import * as path from 'path';

export class EnvLoader {
  private static loaded = false;

  static load(filePath?: string): void {
    if (this.loaded) return;

    const envPath = filePath || path.resolve(process.cwd(), '.env');
    
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        this.parse(content);
        this.loaded = true;
      }
    } catch (error) {
      // Silently ignore errors
    }
  }

  private static parse(content: string): void {
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Only set if not already defined
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
  }

  static get(key: string, defaultValue?: string): string | undefined {
    this.load();
    return process.env[key] || defaultValue;
  }

  static getOrThrow(key: string): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  }

  static has(key: string): boolean {
    this.load();
    return key in process.env;
  }
}