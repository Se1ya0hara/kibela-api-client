import { Command } from '../../core/cli/command';
import { getClient } from '../utils';
import { Spinner } from '../../core/terminal/spinner';
import { colors } from '../../core/terminal/colors';
import * as fs from 'fs';
import * as path from 'path';
import { generateFrontmatter, sanitizeFileName } from '../utils/frontmatter';

export function getCommand(program: Command): void {
  program
    .option('-s, --search <query>', 'Search notes by query')
    .option('-d, --dir <dir>', 'Save to specific directory')
    .option('-o, --output <file>', 'Save to specific file')
    .option('--id <noteId>', 'Get specific note by ID')
    .option('--html', 'Get HTML content instead of markdown')
    .option('--frontmatter', 'Include YAML frontmatter in saved files')
    .option('--group <groupId>', 'Filter by group ID')
    .option('--folder <name>', 'Filter by folder name (requires --group)')
    .action(async ({ options, args }) => {
      const spinner = new Spinner('Fetching notes...');
      
      try {
        spinner.start();
        const client = getClient();
        
        // Handle note ID from args or options
        const noteId = args.length > 0 ? args[0] : options.id;
        
        if (noteId) {
          // Get specific note by ID
          const note = await client.notes.get(noteId);
          if (!note) throw new Error('Note not found');
          spinner.stop();
          
          if (options.output || options.dir) {
            let content = options.html ? note.contentHtml : note.content;
            
            // Add frontmatter if requested
            if (options.frontmatter && !options.html) {
              content = generateFrontmatter(note) + '\n\n' + content;
            }
            
            // Determine file path
            let filePath;
            if (options.output) {
              filePath = options.output;
            } else {
              const fileName = sanitizeFileName(note.title) || noteId.replace(/\//g, '-');
              const extension = options.html ? 'html' : 'md';
              filePath = path.join(options.dir || '.', `${fileName}.${extension}`);
            }
            
            // Create directory if it doesn't exist
            const dirPath = path.dirname(filePath);
            if (dirPath) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`${colors.green('✓')} Note saved to ${filePath}`);
          } else {
            console.log(`\n${colors.bold(note.title)}`);
            console.log(`${colors.gray('─'.repeat(40))}`);
            console.log(options.html ? note.contentHtml : note.content);
          }
        } else if (options.search) {
          // Search mode
          spinner.stop();
          console.error('検索機能は現在のKibela APIの制限により利用できません。');
          console.error('代わりに以下をお試しください:');
          console.error('- グループ指定: kibela get --group <グループID>');
          console.error('- 全ノート取得後にgrep: kibela all --list | grep "検索語"');
          process.exit(1);
          
        } else if (options.group) {
          // Get notes from specific group
          const result = await client.notes.listByGroup(options.group, { 
            first: 100
          });
          spinner.stop();
          
          console.log(`\nFound ${result.notes.nodes.length} notes in group:\n`);
          
          for (const note of result.notes.nodes) {
            if (options.dir) {
              // Save to directory
              fs.mkdirSync(options.dir, { recursive: true });
              
              // Get full content
              const fullNote = await client.notes.get(note.id);
              if (fullNote) {
                let content = fullNote.content;
                
                // Add frontmatter if requested
                if (options.frontmatter) {
                  content = generateFrontmatter(fullNote) + '\n\n' + content;
                }
                
                const fileName = sanitizeFileName(fullNote.title) || fullNote.id.replace(/\//g, '-');
                const filePath = path.join(options.dir, `${fileName}.md`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`${colors.green('✓')} ${note.title} → ${filePath}`);
              }
            } else {
              // List mode
              console.log(`${colors.cyan(note.id)} - ${colors.bold(note.title)}`);
              const folders = note.folders?.edges.map((e: any) => e.node.name).join(', ');
              if (folders) console.log(`  Folders: ${folders}`);
              console.log(`  URL: ${colors.blue(note.url)}\n`);
            }
          }
        } else {
          spinner.stop();
          console.error('Please specify --id, --search, --group, or provide a note ID');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail(`Failed: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
      }
    });
}