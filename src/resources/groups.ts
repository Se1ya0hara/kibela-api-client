import { KibelaClient } from '../client';
import { LIST_GROUPS, GET_GROUP } from '../queries/groups';
import { Group, Connection } from '../types';

export class Groups {
  constructor(private client: KibelaClient) {}

  async list(options?: {
    first?: number;
    after?: string;
  }): Promise<Connection<Group>> {
    const { groups } = await this.client.request<{ groups: Connection<Group> }>(
      LIST_GROUPS,
      {
        first: options?.first ?? 50,
        after: options?.after
      }
    );
    
    // Ensure nodes array exists
    if (!groups.nodes && groups.edges) {
      groups.nodes = groups.edges.map(edge => edge.node);
    }
    
    return groups;
  }

  async get(id: string): Promise<Group | null> {
    const { group } = await this.client.request<{ group: Group | null }>(
      GET_GROUP,
      { id }
    );
    return group;
  }

  async getAll(): Promise<Group[]> {
    const allGroups: Group[] = [];
    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
      const result = await this.list({ first: 100, after });
      allGroups.push(...result.nodes);
      hasNextPage = result.pageInfo.hasNextPage;
      after = result.pageInfo.endCursor;
    }

    return allGroups;
  }
}