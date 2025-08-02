import * as fs from 'fs';
import * as path from 'path';
import { GraphQLClient } from '../../core/graphql/client';
import { FrontMatterParser, ParsedDocument } from './frontmatter';
import { notesQueries } from '../../queries/notes';
import { Note } from '../../types';

export interface SyncOptions {
  team: string;
  token: string;
  dir?: string;
}

export class SyncClient {
  private graphqlClient: GraphQLClient;
  private notesDir: string;

  constructor(options: SyncOptions) {
    const endpoint = `https://${options.team}.kibe.la/api/v1`;
    this.graphqlClient = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    this.notesDir = options.dir || process.env.KIBELA_DIR || './notes';
    this.ensureNotesDir();
  }

  private ensureNotesDir(): void {
    if (!fs.existsSync(this.notesDir)) {
      fs.mkdirSync(this.notesDir, { recursive: true });
    }
  }

  async pull(): Promise<void> {
    console.log('Pulling notes from Kibela...');
    
    let hasNextPage = true;
    let cursor: string | undefined;
    let totalNotes = 0;

    while (hasNextPage) {
      const variables = {
        first: 100,
        after: cursor,
      };

      const response = await this.graphqlClient.request<any>(
        notesQueries.list,
        variables
      );

      const notes = response.notes.edges.map((edge: any) => edge.node);
      
      for (const note of notes) {
        await this.saveNoteToFile(note);
        totalNotes++;
      }

      hasNextPage = response.notes.pageInfo.hasNextPage;
      cursor = response.notes.pageInfo.endCursor;
    }

    console.log(`Pulled ${totalNotes} notes successfully.`);
  }

  async push(filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = FrontMatterParser.parse(content);

    if (!parsed.frontMatter.id) {
      throw new Error('No note ID found in frontmatter. Use publish command for new notes.');
    }

    console.log(`Updating note ${parsed.frontMatter.id}...`);

    const variables = {
      input: {
        id: parsed.frontMatter.id,
        title: parsed.frontMatter.title,
        content: parsed.content,
        coediting: parsed.frontMatter.coediting,
        groupIds: parsed.frontMatter.groups,
        draft: !parsed.frontMatter.published,
      },
    };

    await this.graphqlClient.request(notesQueries.update, variables);
    
    console.log('Note updated successfully.');
  }

  async publish(content: string): Promise<void> {
    const parsed = FrontMatterParser.parse(content);

    if (!parsed.frontMatter.title) {
      throw new Error('Title is required in frontmatter');
    }

    console.log(`Publishing new note: ${parsed.frontMatter.title}...`);

    const variables = {
      input: {
        title: parsed.frontMatter.title,
        content: parsed.content,
        coediting: parsed.frontMatter.coediting ?? true,
        groupIds: parsed.frontMatter.groups || [],
        draft: !parsed.frontMatter.published,
        folders: parsed.frontMatter.folders,
      },
    };

    const response = await this.graphqlClient.request<any>(
      notesQueries.create,
      variables
    );

    const note = response.createNote.note;
    
    // Save the new note locally
    await this.saveNoteToFile(note);
    
    console.log(`Note published successfully: ${note.id}`);
    console.log(`URL: ${note.url}`);
  }

  private async saveNoteToFile(note: any): Promise<void> {
    const noteNumber = this.extractNoteNumber(note.id);
    const fileName = `${noteNumber}.md`;
    const filePath = path.join(this.notesDir, fileName);

    const document: ParsedDocument = {
      frontMatter: {
        id: note.id,
        title: note.title,
        coediting: note.coediting,
        published: note.publishedAt !== null,
        groups: note.groups.map((g: any) => g.id),
        folders: note.folders?.map((f: any) => ({
          groupId: f.group.id,
          folderName: f.name,
        })) || [],
        author: note.author?.account || 'unknown',
        createdAt: note.createdAt,
        updatedAt: note.contentUpdatedAt,
        url: note.url,
      },
      content: note.content,
    };

    const fileContent = FrontMatterParser.stringify(document);
    fs.writeFileSync(filePath, fileContent, 'utf8');
  }

  private extractNoteNumber(noteId: string): string {
    // Extract numeric ID from GraphQL ID (e.g., "Note/12345" -> "12345")
    const match = noteId.match(/Note\/(\d+)/);
    return match ? match[1] : noteId;
  }
}