import { GraphQLClient } from '../core/graphql/client';
import { KibelaConfig } from '../types';

export class KibelaClient {
  private client: GraphQLClient;
  private team: string;

  constructor(config: KibelaConfig) {
    this.team = config.team;
    this.client = new GraphQLClient(`https://${config.team}.kibe.la/api/v1`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': '@kibela/api'
      },
    });
  }

  async request<T>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Kibela API Error: ${error.message}`);
      }
      throw error;
    }
  }

  getTeam(): string {
    return this.team;
  }
}