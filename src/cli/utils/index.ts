import { colors } from '../../core/terminal/colors';
import { Spinner } from '../../core/terminal/spinner';
import { Kibela } from '../../index';
import { ConfigManager } from '../config';
import { validateConfig, sanitizeToken } from '../_validators';
import { KibelaError } from '../_error-handler';

export function success(message: string): void {
  console.log(colors.green('✔'), message);
}

export function error(message: string): void {
  console.error(colors.red('✖'), message);
}

export function info(message: string): void {
  console.log(colors.blue('ℹ'), message);
}

export function warn(message: string): void {
  console.log(colors.yellow('⚠'), message);
}

export function createSpinner(text: string) {
  return new Spinner(text);
}

export function getClient(): Kibela {
  const team = ConfigManager.get('team');
  const token = ConfigManager.get('token');

  const validation = validateConfig(team, token);
  if (!validation.isValid) {
    throw new KibelaError(
      `Configuration error: ${validation.error}\nRun "kibela config" to set up your credentials.`,
      'CONFIG_ERROR'
    );
  }

  try {
    return new Kibela({ team: team!, token: token! });
  } catch (err) {
    throw new KibelaError(
      `Failed to create Kibela client: ${err}`,
      'CLIENT_ERROR'
    );
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function displayToken(token: string): string {
  return sanitizeToken(token);
}

// Re-export frontmatter utilities
export { generateFrontmatter, sanitizeFileName } from './frontmatter';