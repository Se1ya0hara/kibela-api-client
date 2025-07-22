import { KibelaClient } from '../client';
import { 
  CREATE_NOTE, 
  UPDATE_NOTE, 
  DELETE_NOTE, 
  GET_NOTE, 
  LIST_NOTES,
  SEARCH_NOTES,
  LIST_GROUP_NOTES,
  LIST_GROUP_NOTES_LIGHT
} from '../queries/notes';
import { 
  Note, 
  CreateNoteInput, 
  UpdateNoteInput, 
  Connection 
} from '../types';

export class Notes {
  constructor(private client: KibelaClient) {}

  async create(input: CreateNoteInput): Promise<Note> {
    const mutationInput: any = {
      title: input.title,
      content: input.content,
      coediting: input.coediting,
      groupIds: input.groupIds || [],
      draft: input.draft,
      folders: input.folders
    };
    
    const { createNote } = await this.client.request<{
      createNote: { note: Note }
    }>(CREATE_NOTE, { input: mutationInput });
    return createNote.note;
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const { updateNote } = await this.client.request<{
      updateNote: { note: Note }
    }>(UPDATE_NOTE, { 
      input: { ...input, id }
    });
    return updateNote.note;
  }

  async delete(id: string): Promise<string> {
    const { deleteNote } = await this.client.request<{
      deleteNote: { note: { id: string } }
    }>(DELETE_NOTE, { 
      input: { id }
    });
    return deleteNote.note.id;
  }

  async get(id: string): Promise<Note | null> {
    const { note } = await this.client.request<{ note: Note | null }>(
      GET_NOTE, 
      { id }
    );
    return note;
  }

  async list(options?: {
    first?: number;
    after?: string;
    orderBy?: {
      field: 'CONTENT_UPDATED_AT' | 'PUBLISHED_AT';
      direction: 'ASC' | 'DESC';
    };
  }): Promise<Connection<Note>> {
    const { notes } = await this.client.request<{ notes: Connection<Note> }>(
      LIST_NOTES,
      {
        first: options?.first ?? 20,
        after: options?.after,
        orderBy: options?.orderBy
      }
    );
    
    // Ensure nodes array exists
    if (!notes.nodes && notes.edges) {
      notes.nodes = notes.edges.map(edge => edge.node);
    }
    
    return notes;
  }

  async search(query: string, options?: {
    first?: number;
    after?: string;
  }): Promise<Connection<Note>> {
    const { search } = await this.client.request<{ search: Connection<Note> }>(
      SEARCH_NOTES,
      {
        query,
        first: options?.first ?? 20,
        after: options?.after
      }
    );
    
    // Ensure nodes array exists
    if (!search.nodes && search.edges) {
      search.nodes = search.edges.map(edge => edge.node);
    }
    
    return search;
  }

  async listByGroup(groupId: string, options?: {
    first?: number;
    after?: string;
    orderBy?: {
      field: 'CONTENT_UPDATED_AT' | 'PUBLISHED_AT';
      direction: 'ASC' | 'DESC';
    };
    lightweight?: boolean;
  }): Promise<{ group: { id: string; name: string }; notes: Connection<Note> }> {
    const query = options?.lightweight ? LIST_GROUP_NOTES_LIGHT : LIST_GROUP_NOTES;
    const result = await this.client.request<{
      group: {
        id: string;
        name: string;
        notes: Connection<Note>;
      };
    }>(query, {
      groupId,
      first: options?.first ?? 20,
      after: options?.after,
      orderBy: options?.orderBy
    });
    
    // Ensure nodes array exists
    if (!result.group.notes.nodes && result.group.notes.edges) {
      result.group.notes.nodes = result.group.notes.edges.map(edge => edge.node);
    }
    
    return {
      group: { id: result.group.id, name: result.group.name },
      notes: result.group.notes
    };
  }

  // Folder functionality is not supported by current Kibela API
  // These methods are kept for future API updates
  
  // async listFolders(groupId: string): Promise<Array<{ id: string; name: string; notesCount: number }>> {
  //   throw new Error('Folder listing is not currently supported by Kibela API');
  // }

  // async listByFolder(groupId: string, folderName: string, options?: {
  //   first?: number;
  //   after?: string;
  // }): Promise<Connection<Note>> {
  //   throw new Error('Folder filtering is not currently supported by Kibela API');
  // }
}