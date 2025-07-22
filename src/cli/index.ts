#!/usr/bin/env node

import { Command } from 'commander';
import { configCommand } from './commands/config';
import { notesCommand } from './commands/notes';
import { groupsCommand } from './commands/groups';
import { usersCommand } from './commands/users';

const program = new Command();

program
  .name('kibela')
  .description('Kibela API CLI')
  .version('0.1.0');

program.addCommand(configCommand);
program.addCommand(notesCommand);
program.addCommand(groupsCommand);
program.addCommand(usersCommand);

program.parse(process.argv);