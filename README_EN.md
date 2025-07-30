# kibela-api-client

[![npm version](https://img.shields.io/npm/v/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads](https://img.shields.io/npm/dm/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads total](https://img.shields.io/npm/dt/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/kibela-api-client)](https://bundlephobia.com/package/kibela-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node version](https://img.shields.io/node/v/kibela-api-client.svg)](https://nodejs.org)

An unofficial modern TypeScript client for the Kibela API with CLI support.

**Note**: This is an unofficial client library for Kibela. It is not officially supported by Kibela.

## Features

- 🚀 **Type-safe**: Full TypeScript support with complete type definitions
- 🔧 **CLI Tool**: Powerful command-line interface for common operations
- 🔐 **Secure**: API key management with environment variable support
- 📝 **Complete API Coverage**: Notes, users, groups, and more
- ⚡ **Lightweight**: Minimal dependencies, optimized bundle size
- 🌐 **GraphQL**: Direct GraphQL API integration

## Installation

```bash
# npm
npm install kibela-api-client

# yarn
yarn add kibela-api-client

# pnpm
pnpm add kibela-api-client

# Global CLI installation
npm install -g kibela-api-client
```

## Quick Start

### As a Library

```typescript
import { createClient } from 'kibela-api-client';

// Create client instance
const kibela = createClient({
  team: 'your-team-name',
  token: process.env.KIBELA_TOKEN
});

// Create a note
const note = await kibela.notes.create({
  title: 'Meeting Notes',
  content: '# Today\'s Topics\n\n- Project updates\n- Next steps',
  coediting: true,
  groupIds: ['group-id']
});

// Search notes
const results = await kibela.notes.search('project update');

// Get current user
const user = await kibela.users.getCurrentUser();
```

### CLI Usage

#### Configuration

The CLI supports multiple configuration methods with the following priority:

1. Config file (`~/.kibela/config.json`)
2. Environment variables
3. `.env` file in current directory

```bash
# Interactive setup
kibela config

# Set credentials directly
kibela config --team your-team --token your-api-token

# Using environment variables
export KIBELA_TEAM=your-team
export KIBELA_TOKEN=your-api-token

# Or use .env file
echo "KIBELA_TEAM=your-team" >> .env
echo "KIBELA_TOKEN=your-api-token" >> .env
```

#### Commands

##### Notes Management

```bash
# List all notes
kibela all                    # Download to local
kibela all --list             # List only
kibela all -l 20              # Limit to 20 items

# Get specific notes
kibela get <note-id>          # By ID (title becomes filename)
kibela get <id> --frontmatter # Save with frontmatter
kibela get --group <GROUP_ID> # By group

# Update existing note
kibela set notes/123.md       # From file
kibela set --id <note-id> --title "New Title"

# Create new note
kibela new                    # Interactive
kibela new --file note.md     # From file
kibela new --title "Title" --content "Content"
```

##### Workspace Information

```bash
# List all groups
kibela groups
kibela groups --all  # Show all groups without pagination

# List users
kibela users
kibela users --all  # Show all users

# Get current user info
kibela users me
```

## API Reference

### Client Creation

```typescript
const kibela = createClient({
  team: string,    // Your Kibela team name
  token: string    // Your API token
});
```

### Notes API

```typescript
// Create a note
kibela.notes.create({
  title: string,
  content: string,
  coediting?: boolean,
  groupIds?: string[],
  draft?: boolean,
  folders?: Array<{
    groupId: string,
    folderName: string
  }>
})

// Update a note
kibela.notes.update(id: string, {
  title?: string,
  content?: string,
  coediting?: boolean,
  groupIds?: string[],
  draft?: boolean
})

// Delete a note
kibela.notes.delete(id: string)

// Get a note by ID
kibela.notes.get(id: string)

// List notes with pagination
kibela.notes.list({
  first?: number,
  after?: string,
  orderBy?: {
    field: 'CONTENT_UPDATED_AT' | 'PUBLISHED_AT',
    direction: 'ASC' | 'DESC'
  }
})

// Search notes
kibela.notes.search(query: string, {
  first?: number,
  after?: string
})
```

### Groups API

```typescript
// List groups
kibela.groups.list({
  first?: number,
  after?: string
})

// Get a group by ID
kibela.groups.get(id: string)

// Get all groups (no pagination)
kibela.groups.getAll()
```

### Users API

```typescript
// List users
kibela.users.list({
  first?: number,
  after?: string
})

// Get current user
kibela.users.getCurrentUser()

// Get all users (no pagination)
kibela.users.getAll()
```

## Environment Variables

- `KIBELA_TEAM`: Your Kibela team name
- `KIBELA_TOKEN`: Your API token

## Security

- API tokens are never logged or displayed in full
- Tokens are masked in CLI output (shows only first 4 and last 4 characters)
- Support for `.env` files for local development
- Secure storage in user home directory for CLI configuration

## Error Handling

The library provides detailed error messages with specific error codes:

```typescript
try {
  await kibela.notes.create({ title: '', content: '' });
} catch (error) {
  if (error.code === 'AUTH_ERROR') {
    // Handle authentication error
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run CLI in development
npm run dev

# Run tests
npm test
```

## Limitations

- **Search function**: Due to Kibela API limitations, the search function (`--search`) is currently unavailable
  - Alternative: Use `kibela all --list | grep "keyword"` or filter by group

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Se1ya0hara](https://github.com/Se1ya0hara)