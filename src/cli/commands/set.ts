import { Command } from '../../core/cli/command';
import { getConfig } from './config';
import { SyncClient } from '../../sync/sync-client';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';
import { getClient } from '../utils';
import * as fs from 'fs';

export function setCommand(program: Command): void {
  program
    .option('--id <noteId>', 'Note ID to update')
    .option('--title <title>', 'New title')
    .option('--content <content>', 'New content')
    .option('--draft', 'Set as draft')
    .option('--publish', 'Publish the note')
    .action(async ({ args, options }) => {
      const filePath = args[0];
      const spinner = new Spinner('Updating note...');
      
      try {
        spinner.start();
        
        if (filePath && fs.existsSync(filePath)) {
          // Update from file with frontmatter
          const config = await getConfig();
          const client = new SyncClient({
            team: config.team,
            token: config.token,
          });
          
          await client.push(filePath);
          spinner.succeed('Note updated successfully');
        } else if (options.id) {
          // Update by ID with options
          const client = getClient();
          const updateData: any = {};
          
          if (options.title) updateData.title = options.title;
          if (options.content) updateData.content = options.content;
          if (options.draft !== undefined) updateData.draft = options.draft;
          if (options.publish) updateData.draft = false;
          
          if (Object.keys(updateData).length === 0) {
            spinner.stop();
            console.error('No update data provided. Use --title, --content, --draft, or --publish');
            process.exit(1);
          }
          
          await client.notes.update(options.id, updateData);
          spinner.succeed(`Note ${options.id} updated successfully`);
        } else {
          spinner.stop();
          console.error('Please provide a file path or use --id with update options');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail(`Failed to update: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}