import chalk from 'chalk';
import ora from 'ora';
import { Kibela } from '../index';
import { ConfigManager } from './config';
import { validateConfig, sanitizeToken } from './_validators';
import { KibelaError } from './_error-handler';

export function success(message: string): void {
  console.log(chalk.green('✔'), message);
}

export function error(message: string): void {
  console.error(chalk.red('✖'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function createSpinner(text: string) {
  return ora({
    text,
    spinner: 'dots'
  });
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