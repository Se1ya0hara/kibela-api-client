export interface Note {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  contentUpdatedAt: string;
  publishedAt?: string;
  url: string;
  author: User;
  groups: Group[];
  comments?: Comment[];
  coediting: boolean;
  commentsCount?: number;
  folders?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
      };
    }>;
  };
}

export interface User {
  id: string;
  account: string;
  realName: string;
  avatarImage?: {
    url: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
}

export interface Comment {
  id: string;
  content: string;
  contentHtml: string;
  publishedAt: string;
  author: User;
  canEdit: boolean;
  canDestroy: boolean;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  coediting?: boolean;
  groupIds?: string[];
  draft?: boolean;
  folders?: Array<{
    groupId: string;
    folderName: string;
  }>;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  coediting?: boolean;
  groupIds?: string[];
  draft?: boolean;
}

export interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
}

export interface Connection<T> {
  edges: Array<{
    cursor: string;
    node: T;
  }>;
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface KibelaConfig {
  team: string;
  token: string;
}