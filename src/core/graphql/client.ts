import { HttpClient } from '../http/client';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
}

export class GraphQLClient {
  private httpClient: HttpClient;
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, options: { headers?: Record<string, string> } = {}) {
    this.httpClient = new HttpClient();
    this.endpoint = endpoint;
    this.headers = options.headers || {};
  }

  async request<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const body = JSON.stringify({
      query,
      variables,
    });

    const response = await this.httpClient.post(this.endpoint, body, {
      ...this.headers,
      'Content-Type': 'application/json',
    });

    if (response.statusCode !== 200) {
      throw new Error(`GraphQL request failed with status ${response.statusCode}: ${response.body}`);
    }

    const result: GraphQLResponse<T> = JSON.parse(response.body);

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map(e => e.message).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }

    return result.data;
  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  setHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }
}