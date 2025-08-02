import { Command } from '../core/command';
import { getClient } from '../utils';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';

export function groupsCommand(program: Command): void {
  program
    .option('--all', 'Show all groups without pagination')
    .action(async ({ options }) => {
      const spinner = new Spinner('Fetching groups...');
      
      try {
        spinner.start();
        const client = getClient();
        
        let groups;
        if (options.all) {
          groups = await client.groups.getAll();
        } else {
          const result = await client.groups.list({ first: 20 });
          groups = result.nodes;
        }
        
        spinner.stop();
        
        console.log(`\nFound ${groups.length} groups:\n`);
        groups.forEach((group: any) => {
          console.log(`${colors.cyan(group.id)} - ${colors.bold(group.name)}`);
          if (group.description) {
            console.log(`  ${colors.gray(group.description)}`);
          }
          console.log();
        });
      } catch (error) {
        spinner.fail(`Failed: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}