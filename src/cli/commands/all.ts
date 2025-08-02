import { Command } from '../core/command';
import { getConfig } from './config';
import { SyncClient } from '../sync/sync-client';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';
import { getClient } from '../utils';

export function allCommand(program: Command): void {
  program
    .option('-d, --dir <dir>', 'Directory to save notes', './notes')
    .option('-l, --limit <number>', 'Limit number of notes')
    .option('--list', 'List only without downloading')
    .option('--group <groupId>', 'Filter by group ID')
    .action(async ({ options }) => {
      const spinner = new Spinner('Fetching all notes from Kibela...');
      
      try {
        spinner.start();
        
        if (options.list) {
          // List mode
          const client = getClient();
          const limit = options.limit ? parseInt(options.limit, 10) : 20;
          
          let notes;
          if (options.group) {
            const result = await client.notes.listByGroup(options.group, { first: limit });
            notes = result.notes.nodes;
          } else {
            const result = await client.notes.list({ first: limit });
            notes = result.nodes;
          }
          
          spinner.stop();
          
          console.log(`\nFound ${notes.length} notes:\n`);
          notes.forEach((note: any) => {
            const updatedAt = new Date(note.contentUpdatedAt).toLocaleDateString();
            console.log(`${colors.cyan(note.id)} - ${colors.bold(note.title)}`);
            console.log(`  Author: ${note.author?.account || 'Unknown'}, Updated: ${updatedAt}`);
            console.log(`  URL: ${colors.blue(note.url)}\n`);
          });
        } else {
          // Download mode
          const config = await getConfig();
          const client = new SyncClient({
            team: config.team,
            token: config.token,
            dir: options.dir,
          });
          
          await client.pull();
          spinner.succeed(`All notes downloaded to ${options.dir}`);
        }
      } catch (error) {
        spinner.fail(`Failed: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}