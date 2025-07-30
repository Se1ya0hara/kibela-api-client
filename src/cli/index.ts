#!/usr/bin/env node

import { CLI } from '../core/cli/command';
import { configCommand } from './commands/config';
import { allCommand } from './commands/all';
import { getCommand } from './commands/get';
import { setCommand } from './commands/set';
import { newCommand } from './commands/new';
import { groupsCommand } from './commands/groups-simple';
import { usersCommand } from './commands/users';
import { EnvLoader } from '../core/env';

// Load environment variables
EnvLoader.load();

const cli = new CLI('kibela', 'Kibela API CLI - Zero Dependencies');

cli.setVersion('0.2.0');

// Configuration command
const config = cli.command('config', 'Configure Kibela credentials');
configCommand(config);

// Main commands
const all = cli.command('all', 'Get all notes from Kibela');
allCommand(all);

const get = cli.command('get', 'Get specific notes or directory');
getCommand(get);

const set = cli.command('set <file>', 'Update existing note');
setCommand(set);

const newCmd = cli.command('new', 'Create new note');
newCommand(newCmd);

// Utility commands
const groups = cli.command('groups', 'List Kibela groups');
groupsCommand(groups);

const users = cli.command('users', 'List Kibela users');
usersCommand(users);

cli.parse();