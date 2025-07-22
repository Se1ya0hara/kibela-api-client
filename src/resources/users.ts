import { KibelaClient } from '../client';
import { LIST_USERS, GET_CURRENT_USER } from '../queries/users';
import { User, Connection } from '../types';

export class Users {
  constructor(private client: KibelaClient) {}

  async list(options?: {
    first?: number;
    after?: string;
  }): Promise<Connection<User>> {
    const { users } = await this.client.request<{ users: Connection<User> }>(
      LIST_USERS,
      {
        first: options?.first ?? 50,
        after: options?.after
      }
    );
    
    // Ensure nodes array exists
    if (!users.nodes && users.edges) {
      users.nodes = users.edges.map(edge => edge.node);
    }
    
    return users;
  }

  async getCurrentUser(): Promise<User> {
    const { currentUser } = await this.client.request<{ currentUser: User }>(
      GET_CURRENT_USER
    );
    return currentUser;
  }

  async getAll(): Promise<User[]> {
    const allUsers: User[] = [];
    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
      const result = await this.list({ first: 100, after });
      allUsers.push(...result.nodes);
      hasNextPage = result.pageInfo.hasNextPage;
      after = result.pageInfo.endCursor;
    }

    return allUsers;
  }
}