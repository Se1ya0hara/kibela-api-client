import { Command } from 'commander';
import chalk from 'chalk';
import { getClient, error, createSpinner } from '../utils';

export const groupsCommand = new Command('groups')
  .description('List all groups')
  .option('-a, --all', 'Show all groups (no pagination)')
  .action(async (options) => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching groups...');
    spinner.start();

    try {
      if (options.all) {
        const groups = await client.groups.getAll();
        spinner.stop();

        console.log(chalk.bold(`\nTotal groups: ${groups.length}\n`));
        groups.forEach((group) => {
          console.log(chalk.cyan(group.name));
          console.log(`  ID: ${group.id}`);
          console.log(`  Type: ${group.isPrivate ? 'Private' : 'Public'}`);
          if (group.description) {
            console.log(`  Description: ${group.description}`);
          }
          console.log();
        });
      } else {
        const result = await client.groups.list({ first: 20 });
        spinner.stop();

        console.log(chalk.bold(`\nGroups (${result.totalCount} total):\n`));
        result.nodes.forEach((group) => {
          console.log(chalk.cyan(group.name));
          console.log(`  ID: ${group.id}`);
          console.log(`  Type: ${group.isPrivate ? 'Private' : 'Public'}`);
          if (group.description) {
            console.log(`  Description: ${group.description}`);
          }
          console.log();
        });

        if (result.pageInfo.hasNextPage) {
          console.log(chalk.dim('Use --all flag to see all groups'));
        }
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch groups: ${err}`);
    }
  });