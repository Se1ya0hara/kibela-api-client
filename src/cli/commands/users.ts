import { Command } from 'commander';
import chalk from 'chalk';
import { getClient, error, createSpinner, success } from '../utils';

export const usersCommand = new Command('users')
  .description('Manage users');

usersCommand
  .command('list')
  .description('List all users')
  .option('-a, --all', 'Show all users (no pagination)')
  .action(async (options) => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching users...');
    spinner.start();

    try {
      if (options.all) {
        const users = await client.users.getAll();
        spinner.stop();

        console.log(chalk.bold(`\nTotal users: ${users.length}\n`));
        users.forEach((user) => {
          console.log(chalk.cyan(`${user.realName} (@${user.account})`));
          console.log(`  ID: ${user.id}`);
          console.log();
        });
      } else {
        const result = await client.users.list({ first: 20 });
        spinner.stop();

        console.log(chalk.bold(`\nUsers (${result.totalCount} total):\n`));
        result.nodes.forEach((user) => {
          console.log(chalk.cyan(`${user.realName} (@${user.account})`));
          console.log(`  ID: ${user.id}`);
          console.log();
        });

        if (result.pageInfo.hasNextPage) {
          console.log(chalk.dim('Use --all flag to see all users'));
        }
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch users: ${err}`);
    }
  });

usersCommand
  .command('me')
  .description('Get current user information')
  .action(async () => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching user info...');
    spinner.start();

    try {
      const user = await client.users.getCurrentUser();
      spinner.stop();

      console.log(chalk.bold.cyan('\nCurrent User:\n'));
      console.log(`Name: ${user.realName}`);
      console.log(`Account: @${user.account}`);
      console.log(`ID: ${user.id}`);
      if (user.avatarImage?.url) {
        console.log(`Avatar: ${user.avatarImage.url}`);
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch current user: ${err}`);
    }
  });