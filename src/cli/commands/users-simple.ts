import { Command } from '../../core/cli/command';
import { getClient } from '../utils';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';

export function usersCommand(program: Command): void {
  const list = program.command('list', 'List all users');
  list
    .option('--all', 'Show all users without pagination')
    .action(async ({ options }) => {
      const spinner = new Spinner('Fetching users...');
      
      try {
        spinner.start();
        const client = getClient();
        
        let users;
        if (options.all) {
          users = await client.users.getAll();
        } else {
          const result = await client.users.list({ first: 20 });
          users = result.nodes;
        }
        
        spinner.stop();
        
        console.log(`\nFound ${users.length} users:\n`);
        users.forEach((user: any) => {
          console.log(`${colors.cyan(user.account)} - ${colors.bold(user.realName || 'No name')}`);
          if ((user as any).email) {
            console.log(`  Email: ${(user as any).email}`);
          }
          console.log();
        });
      } catch (error) {
        spinner.fail(`Failed: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
  
  const me = program.command('me', 'Show current user info');
  me.action(async () => {
    const spinner = new Spinner('Fetching user info...');
    
    try {
      spinner.start();
      const client = getClient();
      const user = await client.users.getCurrentUser();
      
      spinner.stop();
      
      console.log('\nCurrent User:');
      console.log(`Account: ${colors.cyan(user.account)}`);
      console.log(`Name: ${colors.bold(user.realName || 'No name')}`);
      if ((user as any).email) console.log(`Email: ${(user as any).email}`);
      if (user.avatarImage?.url) console.log(`Avatar: ${user.avatarImage.url}`);
    } catch (error) {
      spinner.fail(`Failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });
}