import * as https from 'https';
import { URL } from 'url';

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: string;
}

export class HttpClient {
  async request(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const headers: Record<string, string> = {
        'User-Agent': 'kibela-api-client',
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (options.body) {
        headers['Content-Length'] = Buffer.byteLength(options.body).toString();
      }

      const reqOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers,
      };

      const req = https.request(reqOptions, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers as Record<string, string | string[]>,
            body,
          });
        });
      });

      req.on('error', (err) => {
        reject(new Error(`HTTP request failed: ${err.message}`));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async get(url: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(url, { method: 'GET', headers });
  }

  async post(url: string, body: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(url, { method: 'POST', body, headers });
  }
}