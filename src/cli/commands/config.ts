import { Command } from '../../core/cli/command';
import { prompt } from '../../core/terminal/prompt';
import { ConfigManager } from '../config';
import { success, info, error, displayToken } from '../utils';
import { wrapAsyncCommand } from '../_error-handler';
import { validateConfig } from '../_validators';

export function configCommand(program: Command): void {
  program
    .option('-t, --team <team>', 'Set team name')
    .option('-k, --token <token>', 'Set API token')
    .option('--show', 'Show current configuration')
    .option('--clear', 'Clear all configuration')
    .action(wrapAsyncCommand(async ({ options }: { options: any }) => {
      if (options.show) {
        const config = ConfigManager.load();
        if (config.team || config.token) {
          info('Current configuration:');
          console.log(`  Team: ${config.team || '(not set)'}`);
          console.log(`  Token: ${config.token ? displayToken(config.token) : '(not set)'}`);
        } else {
          info('No configuration found.');
        }
        return;
      }

      if (options.clear) {
        const confirm = await prompt({
          type: 'confirm',
          message: 'Are you sure you want to clear all configuration?',
          default: false
        });

        if (confirm) {
          ConfigManager.clear();
          success('Configuration cleared.');
        }
        return;
      }

      if (options.team) {
        ConfigManager.set('team', options.team);
        success(`Team set to: ${options.team}`);
      }

      if (options.token) {
        ConfigManager.set('token', options.token);
        success('API token saved.');
      }

      if (!options.team && !options.token) {
        const currentConfig = ConfigManager.load();
        
        const team = await prompt({
          type: 'text',
          message: 'Enter your Kibela team name:',
          default: currentConfig.team || '',
          validate: (value: string) => value.length > 0 || 'Team name is required'
        });

        if (!team) {
          error('Configuration cancelled.');
          return;
        }

        const token = await prompt({
          type: 'password',
          message: 'Enter your Kibela API token:',
          validate: (value: string) => value.length > 0 || 'API token is required'
        });

        if (!token) {
          error('Configuration cancelled.');
          return;
        }

        ConfigManager.set('team', team);
        ConfigManager.set('token', token);
        success('Configuration saved successfully!');
        info(`You can now use the Kibela CLI with team: ${team}`);
      }
    }));
}

export async function getConfig(): Promise<{ team: string; token: string }> {
  const team = ConfigManager.get('team');
  const token = ConfigManager.get('token');

  const validation = validateConfig(team, token);
  if (!validation.isValid) {
    throw new Error(
      `Configuration error: ${validation.error}\nRun "kibela config" to set up your credentials.`
    );
  }

  return { team: team!, token: token! };
}