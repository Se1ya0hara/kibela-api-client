import { Command } from '../../core/cli/command';
import { SyncClient } from '../../sync/sync-client';
import { getConfig } from './config';
import { colors } from '../../core/terminal/colors';
import { Spinner } from '../../core/terminal/spinner';
import * as fs from 'fs';

export function syncCommand(program: Command): void {
  // Download command
  program
    .command('download')
    .option('-d, --dir <dir>', 'Directory to save notes', './notes')
    .option('-p, --prefix <prefix>', 'File prefix for notes', 'note-')
    .action(async ({ options }) => {
      const config = await getConfig();
      const spinner = new Spinner('Downloading notes from Kibela workspace...');
      
      try {
        spinner.start();
        
        const client = new SyncClient({
          team: config.team,
          token: config.token,
          dir: options.dir,
        });
        
        await client.pull();
        spinner.succeed('All notes downloaded to local workspace');
      } catch (error) {
        spinner.fail(`Failed to pull notes: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });

  // Upload command
  program
    .command('upload <file>')
    .option('--draft', 'Upload as draft', false)
    .action(async ({ args, options }) => {
      const config = await getConfig();
      const filePath = args[0];
      const spinner = new Spinner(`Uploading ${filePath} to Kibela workspace...`);
      
      try {
        spinner.start();
        
        const client = new SyncClient({
          team: config.team,
          token: config.token,
        });
        
        await client.push(filePath);
        spinner.succeed('Note uploaded to workspace successfully');
      } catch (error) {
        spinner.fail(`Failed to push note: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });

  // Create command
  program
    .command('create')
    .option('-f, --file <file>', 'File to create from (otherwise reads from stdin)')
    .option('-g, --groups <groups...>', 'Group IDs for the note')
    .action(async ({ options }) => {
      const config = await getConfig();
      const spinner = new Spinner('Creating new note in Kibela workspace...');
      
      try {
        let content: string;
        
        if (options.file) {
          if (!fs.existsSync(options.file)) {
            throw new Error(`File not found: ${options.file}`);
          }
          content = fs.readFileSync(options.file, 'utf8');
        } else {
          // Read from stdin
          content = await readStdin();
          if (!content) {
            throw new Error('No content provided. Use -f option or pipe content to stdin.');
          }
        }
        
        spinner.start();
        
        const client = new SyncClient({
          team: config.team,
          token: config.token,
        });
        
        await client.publish(content);
        spinner.succeed('Note created in workspace successfully');
      } catch (error) {
        spinner.fail(`Failed to publish note: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    let data = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      resolve(data);
    });
    
    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
}