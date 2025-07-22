import { KibelaClient } from '../client';
import { LIST_FOLDERS, GET_FOLDER } from '../queries/folders';
import { Connection } from '../types';

export interface Folder {
  id: string;
  name: string;
  path?: string;
  notes?: Connection<{
    id: string;
    title: string;
    contentUpdatedAt: string;
    url: string;
    author: {
      id: string;
      account: string;
      realName: string;
    };
  }>;
}

export class Folders {
  constructor(private client: KibelaClient) {}

  /**
   * List all folders with pagination support
   */
  async list(options?: {
    first?: number;
    after?: string;
  }): Promise<Connection<Folder>> {
    const { folders } = await this.client.request<{ folders: Connection<Folder> }>(
      LIST_FOLDERS,
      {
        first: options?.first ?? 100,
        after: options?.after
      }
    );
    
    // Ensure nodes array exists
    if (!folders.nodes && folders.edges) {
      folders.nodes = folders.edges.map(edge => edge.node);
    }
    
    return folders;
  }

  /**
   * Get all folders (handles pagination automatically)
   */
  async listAll(): Promise<Folder[]> {
    const allFolders: Folder[] = [];
    let hasNextPage = true;
    let cursor: string | undefined;
    
    while (hasNextPage) {
      const result = await this.list({
        first: 100,
        after: cursor
      });
      
      allFolders.push(...result.nodes);
      hasNextPage = result.pageInfo.hasNextPage;
      cursor = result.pageInfo.endCursor;
    }
    
    return allFolders;
  }

  /**
   * Get a specific folder with its notes
   */
  async get(id: string): Promise<Folder | null> {
    const { folder } = await this.client.request<{ folder: Folder | null }>(
      GET_FOLDER,
      { id }
    );
    
    if (folder && folder.notes && !folder.notes.nodes && folder.notes.edges) {
      folder.notes.nodes = folder.notes.edges.map(edge => edge.node);
    }
    
    return folder;
  }
}