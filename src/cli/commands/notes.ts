import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getClient, success, error, info, warn, createSpinner, formatDate } from '../utils';
import { Note } from '../../types';

export const notesCommand = new Command('notes')
  .description('Manage Kibela notes');

notesCommand
  .command('list')
  .description('List recent notes')
  .option('-l, --limit <number>', 'Number of notes to show', '10')
  .option('-s, --search <query>', 'Search notes by query')
  .option('-g, --group <groupId>', 'Filter by group ID')
  .option('-f, --folder <folderName>', 'Filter by folder name (requires --group)')
  .action(async (options) => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching notes...');
    spinner.start();

    try {
      const limit = parseInt(options.limit, 10);
      
      if (options.folder && !options.group) {
        spinner.stop();
        error('--folder option requires --group option');
        return;
      }

      if (options.search) {
        const result = await client.notes.search(options.search, { first: limit });
        spinner.stop();
        
        if (result.totalCount === 0) {
          info('No notes found matching your search.');
          return;
        }

        console.log(chalk.bold(`\nFound ${result.totalCount} notes:\n`));
        result.nodes.forEach((note) => {
          console.log(chalk.cyan(`${note.title}`));
          console.log(`  ID: ${note.id}`);
          console.log(`  Author: ${note.author.realName} (@${note.author.account})`);
          console.log(`  Updated: ${formatDate(note.contentUpdatedAt)}`);
          console.log(`  URL: ${note.url}`);
          console.log();
        });
      } else if (options.group) {
        if (options.folder) {
          // Use lightweight query and pagination for folder filtering
          spinner.text = 'Fetching notes with pagination...';
          
          const allNotes: Note[] = [];
          let hasNextPage = true;
          let cursor: string | undefined;
          let foundEnough = false;
          let groupName = '';
          
          while (hasNextPage && !foundEnough) {
            const result = await client.notes.listByGroup(options.group, {
              first: 10, // Small batch to reduce query cost
              after: cursor,
              orderBy: { field: 'CONTENT_UPDATED_AT', direction: 'DESC' },
              lightweight: true
            });
            
            if (!groupName) groupName = result.group.name;
            
            // Filter notes in this batch
            const batchFiltered = result.notes.nodes.filter(note => 
              note.folders && note.folders.edges.some(edge => edge.node.name === options.folder)
            );
            
            allNotes.push(...batchFiltered);
            
            // Check if we have enough notes
            if (allNotes.length >= limit) {
              foundEnough = true;
            }
            
            hasNextPage = result.notes.pageInfo.hasNextPage;
            cursor = result.notes.pageInfo.endCursor;
            
            // Update spinner
            spinner.text = `Fetching notes... (found ${allNotes.length} matching notes)`;
          }
          
          spinner.stop();
          
          if (allNotes.length === 0) {
            info(`No notes found in folder "${options.folder}"`);
            return;
          }

          console.log(chalk.bold(`\nNotes in folder "${options.folder}" in group "${groupName}":\n`));
          allNotes.slice(0, limit).forEach((note: Note) => {
            console.log(chalk.cyan(`${note.title}`));
            console.log(`  ID: ${note.id}`);
            console.log(`  Author: ${note.author.realName} (@${note.author.account})`);
            console.log(`  Updated: ${formatDate(note.contentUpdatedAt)}`);
            console.log(`  URL: ${note.url}`);
            const folderNames = note.folders?.edges.map((edge: any) => edge.node.name).join(', ');
            if (folderNames) {
              console.log(`  Folders: ${folderNames}`);
            }
            console.log();
          });
        } else {
          const result = await client.notes.listByGroup(options.group, {
            first: limit,
            orderBy: { field: 'CONTENT_UPDATED_AT', direction: 'DESC' }
          });
          spinner.stop();

          console.log(chalk.bold(`\nNotes in group "${result.group.name}" (${result.notes.totalCount} total):\n`));
          result.notes.nodes.forEach((note) => {
            console.log(chalk.cyan(`${note.title}`));
            console.log(`  ID: ${note.id}`);
            console.log(`  Author: ${note.author.realName} (@${note.author.account})`);
            console.log(`  Updated: ${formatDate(note.contentUpdatedAt)}`);
            console.log(`  URL: ${note.url}`);
            console.log();
          });
        }
      } else {
        const result = await client.notes.list({ 
          first: limit,
          orderBy: { field: 'CONTENT_UPDATED_AT', direction: 'DESC' }
        });
        spinner.stop();

        console.log(chalk.bold(`\nRecent notes (${result.totalCount} total):\n`));
        result.nodes.forEach((note) => {
          console.log(chalk.cyan(`${note.title}`));
          console.log(`  ID: ${note.id}`);
          console.log(`  Author: ${note.author.realName} (@${note.author.account})`);
          console.log(`  Updated: ${formatDate(note.contentUpdatedAt)}`);
          console.log(`  URL: ${note.url}`);
          console.log();
        });
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch notes: ${err}`);
    }
  });

notesCommand
  .command('folders')
  .description('List folders in a group')
  .requiredOption('-g, --group <groupId>', 'Group ID')
  .action(async (options) => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching folders...');
    spinner.start();

    try {
      // Use lightweight query and pagination to scan all notes
      spinner.text = 'Fetching all notes to extract folders...';
      
      const folderMap = new Map<string, number>();
      let hasNextPage = true;
      let cursor: string | undefined;
      let groupName = '';
      let scannedCount = 0;
      
      while (hasNextPage) {
        const result = await client.notes.listByGroup(options.group, {
          first: 20, // Moderate batch size
          after: cursor,
          orderBy: { field: 'CONTENT_UPDATED_AT', direction: 'DESC' },
          lightweight: true
        });
        
        if (!groupName) groupName = result.group.name;
        
        result.notes.nodes.forEach(note => {
          if (note.folders && note.folders.edges) {
            note.folders.edges.forEach(edge => {
              folderMap.set(edge.node.name, (folderMap.get(edge.node.name) || 0) + 1);
            });
          }
        });
        
        scannedCount += result.notes.nodes.length;
        hasNextPage = result.notes.pageInfo.hasNextPage;
        cursor = result.notes.pageInfo.endCursor;
        
        // Update spinner
        spinner.text = `Scanning notes... (${scannedCount} notes processed, ${folderMap.size} folders found)`;
      }
      
      spinner.stop();
      
      const folders = Array.from(folderMap.entries());
      
      if (folders.length === 0) {
        info('No folders found in this group.');
        return;
      }

      console.log(chalk.bold(`\nFolders in group "${groupName}":\n`));
      folders.sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
        console.log(chalk.cyan(`${name}`));
        console.log(`  Notes: ${count}`);
        console.log();
      });
      
      info(`Scanned ${scannedCount} notes total.`);
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch folders: ${err}`);
    }
  });

notesCommand
  .command('create')
  .description('Create a new note')
  .option('-t, --title <title>', 'Note title')
  .option('-c, --content <content>', 'Note content')
  .option('-m, --markdown <file>', 'Markdown file to use as content')
  .option('-g, --groups <groups...>', 'Group IDs to publish to')
  .option('-f, --folder <folderName>', 'Folder name to create note in (requires --groups)')
  .option('--coediting', 'Enable co-editing', false)
  .option('--draft', 'Save as draft', false)
  .action(async (options) => {
    const client = getClient();
    if (!client) return;

    let title = options.title;
    let content = options.content;

    // Load content from markdown file if specified
    if (options.markdown) {
      try {
        const filePath = path.resolve(options.markdown);
        if (!fs.existsSync(filePath)) {
          error(`Markdown file not found: ${filePath}`);
          return;
        }
        content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract title from first H1 if not provided
        if (!title) {
          const h1Match = content.match(/^#\s+(.+)$/m);
          if (h1Match) {
            title = h1Match[1];
            info(`Using title from markdown: ${title}`);
          }
        }
      } catch (err) {
        error(`Failed to read markdown file: ${err}`);
        return;
      }
    }

    if (!title || !content) {
      const questions: prompts.PromptObject[] = [];
      
      if (!title) {
        questions.push({
          type: 'text',
          name: 'title',
          message: 'Note title:',
          validate: (value: string) => value.length > 0 || 'Title is required'
        });
      }

      if (!content) {
        questions.push({
          type: 'text',
          name: 'content',
          message: 'Note content (Markdown supported):',
          validate: (value: string) => value.length > 0 || 'Content is required'
        });
      }

      const answers = await prompts(questions);
      title = title || answers.title;
      content = content || answers.content;

      if (!title || !content) {
        error('Note creation cancelled.');
        return;
      }
    }

    // Validate folder option
    if (options.folder && !options.groups) {
      error('The --folder option requires --groups to be specified.');
      return;
    }

    const spinner = createSpinner('Creating note...');
    spinner.start();

    try {
      const note = await client.notes.create({
        title,
        content,
        coediting: options.coediting,
        groupIds: options.groups,
        draft: options.draft,
        folders: options.folder && options.groups ? 
          options.groups.map((groupId: string) => ({ groupId, folderName: options.folder })) : 
          undefined
      });

      spinner.stop();
      success(`Note created successfully!`);
      console.log(`  Title: ${note.title}`);
      console.log(`  ID: ${note.id}`);
      console.log(`  URL: ${note.url}`);
      if (options.folder) {
        console.log(`  Folder: ${options.folder}`);
      }
      if (note.groups && note.groups.length > 0) {
        console.log(`  Groups: ${note.groups.map(g => g.name).join(', ')}`);
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to create note: ${err}`);
    }
  });

notesCommand
  .command('get <id>')
  .description('Get a note by ID')
  .option('-o, --output <file>', 'Save content to markdown file')
  .option('--html', 'Show HTML content instead of markdown')
  .action(async (id, options) => {
    const client = getClient();
    if (!client) return;

    const spinner = createSpinner('Fetching note...');
    spinner.start();

    try {
      const note = await client.notes.get(id);
      spinner.stop();

      if (!note) {
        error('Note not found.');
        return;
      }

      console.log(chalk.bold.cyan(`\n${note.title}\n`));
      console.log(`ID: ${note.id}`);
      console.log(`Author: ${note.author.realName} (@${note.author.account})`);
      console.log(`Updated: ${formatDate(note.contentUpdatedAt)}`);
      console.log(`URL: ${note.url}`);
      console.log(`Co-editing: ${note.coediting ? 'Enabled' : 'Disabled'}`);
      
      if (note.groups.length > 0) {
        console.log(`Groups: ${note.groups.map(g => g.name).join(', ')}`);
      }
      
      if (note.folders && note.folders.edges.length > 0) {
        console.log(`Folders: ${note.folders.edges.map(e => e.node.name).join(', ')}`);
      }

      console.log(chalk.bold('\nContent:'));
      console.log('---');
      console.log(options.html ? note.contentHtml : note.content);
      console.log('---');
      
      // Save to file if requested
      if (options.output) {
        try {
          const outputPath = path.resolve(options.output);
          const contentToSave = `# ${note.title}\n\n${note.content}`;
          fs.writeFileSync(outputPath, contentToSave, 'utf-8');
          success(`\nContent saved to: ${outputPath}`);
        } catch (err) {
          error(`Failed to save content: ${err}`);
        }
      }
    } catch (err) {
      spinner.stop();
      error(`Failed to fetch note: ${err}`);
    }
  });

notesCommand
  .command('update <id>')
  .description('Update a note')
  .option('-t, --title <title>', 'New title')
  .option('-c, --content <content>', 'New content')
  .option('-m, --markdown <file>', 'Markdown file to use as content')
  .action(async (id, options) => {
    const client = getClient();
    if (!client) return;

    // Load content from markdown file if specified
    if (options.markdown) {
      try {
        const filePath = path.resolve(options.markdown);
        if (!fs.existsSync(filePath)) {
          error(`Markdown file not found: ${filePath}`);
          return;
        }
        options.content = fs.readFileSync(filePath, 'utf-8');
        info('Loaded content from markdown file');
      } catch (err) {
        error(`Failed to read markdown file: ${err}`);
        return;
      }
    }

    if (!options.title && !options.content) {
      error('Please provide --title, --content, or --markdown to update.');
      return;
    }

    const spinner = createSpinner('Updating note...');
    spinner.start();

    try {
      const input: any = {};
      if (options.title) input.title = options.title;
      if (options.content) input.content = options.content;

      const note = await client.notes.update(id, input);
      spinner.stop();
      success('Note updated successfully!');
      console.log(`  Title: ${note.title}`);
      console.log(`  URL: ${note.url}`);
    } catch (err) {
      spinner.stop();
      error(`Failed to update note: ${err}`);
    }
  });

notesCommand
  .command('delete <id>')
  .description('Delete a note')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id, options) => {
    const client = getClient();
    if (!client) return;

    if (!options.force) {
      const response = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this note?',
        initial: false
      });

      if (!response.confirm) {
        info('Deletion cancelled.');
        return;
      }
    }

    const spinner = createSpinner('Deleting note...');
    spinner.start();

    try {
      await client.notes.delete(id);
      spinner.stop();
      success('Note deleted successfully!');
    } catch (err) {
      spinner.stop();
      error(`Failed to delete note: ${err}`);
    }
  });