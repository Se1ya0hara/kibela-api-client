import { Command } from '../../core/cli/command';
import { getConfig } from './config';
import { SyncClient } from '../../sync/sync-client';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';
import { getClient } from '../utils';
import { prompt } from '../../core/terminal/prompt';
import * as fs from 'fs';
import * as path from 'path';

export function newCommand(program: Command): void {
  program
    .option('-f, --file <file>', 'Create from markdown file')
    .option('-t, --title <title>', 'Note title')
    .option('-c, --content <content>', 'Note content')
    .option('-d, --dir <dir>', 'Save created note to directory')
    .option('-g, --groups <groups...>', 'Group IDs for the note')
    .option('--folder <name>', 'Folder name (requires single group)')
    .option('--draft', 'Create as draft', false)
    .option('--coediting', 'Enable co-editing', true)
    .action(async ({ options }) => {
      const spinner = new Spinner('Creating new note...');
      
      try {
        let title: string;
        let content: string;
        let groups: string[] = options.groups || [];
        
        if (options.file) {
          // Create from file
          if (!fs.existsSync(options.file)) {
            throw new Error(`File not found: ${options.file}`);
          }
          
          const fileContent = fs.readFileSync(options.file, 'utf8');
          
          // Check if it has frontmatter
          if (fileContent.startsWith('---\n')) {
            // Use sync client for frontmatter files
            spinner.start();
            const config = await getConfig();
            const client = new SyncClient({
              team: config.team,
              token: config.token,
            });
            
            await client.publish(fileContent);
            spinner.succeed('Note created successfully');
            return;
          } else {
            // Plain markdown file
            content = fileContent;
            title = options.title || path.basename(options.file, path.extname(options.file));
          }
        } else if (options.title && options.content) {
          // Create from command line options
          title = options.title;
          content = options.content;
        } else {
          // Interactive mode
          spinner.stop();
          
          title = await prompt({
            type: 'text',
            message: 'Note title:',
            validate: (value: string) => value.trim().length > 0 || 'Title is required'
          });
          
          content = await prompt({
            type: 'text',
            message: 'Note content:',
            validate: (value: string) => value.trim().length > 0 || 'Content is required'
          });
          
          if (groups.length === 0) {
            const addGroups = await prompt({
              type: 'confirm',
              message: 'Add to groups?',
              default: false
            });
            
            if (addGroups) {
              const groupIds = await prompt({
                type: 'text',
                message: 'Enter group IDs (comma-separated):'
              });
              groups = groupIds.split(',').map((g: string) => g.trim()).filter(Boolean);
            }
          }
          
          spinner.start('Creating new note...');
        }
        
        // Create the note
        const client = getClient();
        const createData: any = {
          title,
          content,
          coediting: options.coediting,
          draft: options.draft,
          groupIds: groups
        };
        
        // Add folder if specified
        if (options.folder && groups.length === 1) {
          createData.folders = [{
            groupId: groups[0],
            folderName: options.folder
          }];
        }
        
        const note = await client.notes.create(createData);
        spinner.succeed('Note created successfully');
        
        console.log(`\n${colors.bold('Created Note:')}`);
        console.log(`ID: ${colors.cyan(note.id)}`);
        console.log(`Title: ${note.title}`);
        console.log(`URL: ${colors.blue(note.url)}`);
        
        // Save to directory if specified
        if (options.dir) {
          const fileName = `${note.id.replace(/\//g, '-')}.md`;
          const filePath = path.join(options.dir, fileName);
          fs.mkdirSync(options.dir, { recursive: true });
          
          // Create with frontmatter
          const frontmatter = [
            '---',
            `id: ${note.id}`,
            `title: ${note.title}`,
            `url: ${note.url}`,
            `createdAt: ${new Date().toISOString()}`,
            '---',
            '',
            note.content
          ].join('\n');
          
          fs.writeFileSync(filePath, frontmatter, 'utf8');
          console.log(`\nSaved to: ${filePath}`);
        }
      } catch (error) {
        spinner.fail(`Failed to create: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}