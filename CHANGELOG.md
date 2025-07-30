# Changelog

## [0.2.0] - 2025-07-30

### Breaking Changes
- Removed external dependencies - now zero dependencies
- Changed environment variable from `KIBELA_API_KEY` to `KIBELA_TOKEN`
- Search functionality temporarily disabled due to Kibela API limitations
- Simplified CLI commands:
  - `kibela notes list` → `kibela all`
  - `kibela users list` → `kibela users`

### Added
- `--frontmatter` option for `get` command to include YAML metadata
- Automatic filename generation from note titles
- Complete internal implementations replacing all external packages:
  - Custom HTTP client (replacing graphql-request)
  - Custom CLI framework (replacing commander)
  - Custom terminal colors (replacing chalk)
  - Custom spinner (replacing ora)
  - Custom prompt system (replacing prompts)
  - Custom env loader (replacing dotenv)
  - Custom validator (replacing zod)

### Changed
- All file operations now use note titles as filenames (with sanitization)
- Simplified command structure to 4 main commands: `all`, `get`, `set`, `new`
- `--no-download` changed to `--list` for the `all` command

### Fixed
- TypeScript type errors
- CLI option parsing for long-form options after arguments
- Null check errors in note retrieval
- Duplicate KIBELA_TOKEN entries in validators

## [0.1.9] - 2025-07-23

### Documentation
- Added Japanese README with English version link
- Replaced specific IDs and folder names with generic placeholders in examples
- Added unofficial library disclaimer to clarify this is not officially supported by Kibela, Inc.
- Updated license attribution to MIT © Se1ya0hara

### Removed
- Removed setup-github.md file
- Added description.md and memo.md to .gitignore

## [0.1.8] - 2025-07-23

### Fixed
- Corrected repository URL to https://github.com/Se1ya0hara/kibela-api-client
- Corrected homepage and bugs URLs

### Note
- Please make the GitHub repository public to enable issue tracking and contributions

## [0.1.7] - 2025-07-23

### Documentation
- Added missing documentation for markdown file support in README
- Added documentation for note content export (`--output` option)
- Added documentation for HTML content display (`--html` option)
- Added documentation for group and folder filtering
- Added documentation for listing folders in a group

### No Code Changes
- This release only updates documentation

## [0.1.6] - 2025-07-23

### Added
- Clear validation message when using --folder without --groups
- Display folder name in success message after note creation
- Display group names in success message after note creation

### Improved
- README documentation with folder creation examples
- API reference documentation to include folders parameter

### Fixed
- Folder creation was already working but documentation was unclear

## [0.1.5] - 2025-07-23

### Fixed
- GraphQL query cost exceeding limit error (REQUEST_LIMIT_EXCEEDED)
- Reduced query cost by using lightweight queries for folder filtering
- Implemented pagination with smaller batch sizes (10-20 items)

### Changed
- Folder filtering now uses pagination to fetch notes in small batches
- `folders` command now scans all notes using pagination
- Default batch size reduced from 100 to 10-20 items to stay under cost limit
- Added progress indicators during pagination

### Added  
- Lightweight query variant (LIST_GROUP_NOTES_LIGHT) for reduced cost
- Query cost limit documentation in memo.md

## [0.1.4] - 2025-07-22

### Added
- Markdown file support for note creation and updates (`--markdown` option)
- Save note content to file option for `get` command (`--output` option)
- HTML content display option for `get` command (`--html` option)
- Dedicated Folders resource with pagination support
- `kibela.folders.listAll()` method for fetching all folders with automatic pagination
- Title extraction from markdown H1 when creating notes

### Changed  
- Increased folders connection limit from 10 to 100 items
- Enhanced note content display with separators and folder information
- Improved error messages for file operations

### Fixed
- Import statements to include fs and path modules

## [0.1.3] - 2025-07-22

### Added
- Folder support using the correct `folders` (plural) field from Kibela API
- `--folder` option for filtering notes by folder name 
- `folders` command to list all folders in a group
- Support for creating notes in folders using `--folder` option with `--groups`

### Fixed
- Changed from singular `folder` to plural `folders` field to match Kibela API schema
- Added required `first` parameter to folders connection query
- Implemented client-side folder filtering since API doesn't support server-side filtering

### Changed
- Folder field is now a GraphQL connection type with edges/node structure
- Removed debug console logs from CLI utils

## [0.1.2] - 2025-07-22

### Fixed
- Fixed folder field to only include `name` property (not `id`)
- Removed unsupported folder filtering from Kibela API
- Implemented client-side folder filtering as a workaround
- Updated folders command to extract folder names from notes

### Removed
- Removed test scripts and Jest dependencies
- Removed self-dependency from package.json

## [0.1.1] - 2025-07-23

### Added
- Group-based note listing functionality
  - `kibela notes list --group <groupId>` - List notes in a specific group
  - `kibela notes list --group <groupId> --folder <folderName>` - List notes in a specific folder
- Folder management commands
  - `kibela notes folders --group <groupId>` - List all folders in a group
- Create notes in specific folders
  - `kibela notes create --folder <folderName>` - Create note in a specific folder
- New API methods
  - `kibela.notes.listByGroup()` - Get notes by group ID
  - `kibela.notes.listFolders()` - Get folders in a group
  - `kibela.notes.listByFolder()` - Get notes in a specific folder

### Fixed
- Fixed authorization header case sensitivity issue
- Removed GraphQL fragments that were not supported by Kibela API
- Fixed Connection type to ensure nodes array exists

## [0.1.0] - 2025-07-22

### Initial Release
- Basic Kibela API client with TypeScript support
- CLI tool for common operations
- Support for notes, users, and groups
- Environment variable configuration support
- Automatic .env file loading