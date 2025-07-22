import { Command } from 'commander';
import prompts from 'prompts';
import { ConfigManager } from '../config';
import { success, info, error, displayToken } from '../utils';
import { wrapAsyncCommand } from '../_error-handler';
import { validateConfig } from '../_validators';

export const configCommand = new Command('config')
  .description('Configure Kibela API settings')
  .option('-t, --team <team>', 'Set team name')
  .option('-k, --token <token>', 'Set API token')
  .option('--show', 'Show current configuration')
  .option('--clear', 'Clear all configuration')
  .action(wrapAsyncCommand(async (options: any) => {
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
      const response = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to clear all configuration?',
        initial: false
      });

      if (response.confirm) {
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
      
      const questions: prompts.PromptObject[] = [
        {
          type: 'text',
          name: 'team',
          message: 'Enter your Kibela team name:',
          initial: currentConfig.team || '',
          validate: (value: string) => value.length > 0 || 'Team name is required'
        },
        {
          type: 'password',
          name: 'token',
          message: 'Enter your Kibela API token:',
          validate: (value: string) => value.length > 0 || 'API token is required'
        }
      ];

      const response = await prompts(questions);

      if (response.team && response.token) {
        ConfigManager.set('team', response.team);
        ConfigManager.set('token', response.token);
        success('Configuration saved successfully!');
        info(`You can now use the Kibela CLI with team: ${response.team}`);
      } else {
        error('Configuration cancelled.');
      }
    }
  }));