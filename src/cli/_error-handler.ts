import chalk from 'chalk';
import { GraphQLError } from 'graphql-request/build/esm/types';

export class KibelaError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KibelaError';
  }
}

export function handleGraphQLError(error: any): never {
  if (error.response?.errors) {
    const errors = error.response.errors as GraphQLError[];
    const messages = errors.map(e => e.message).join('\n');
    
    // Check for specific error types
    if (messages.includes('authentication') || messages.includes('unauthorized')) {
      throw new KibelaError(
        'Authentication failed. Please check your API token.',
        'AUTH_ERROR',
        errors
      );
    }
    
    if (messages.includes('not found')) {
      throw new KibelaError(
        'Resource not found. Please check the ID and try again.',
        'NOT_FOUND',
        errors
      );
    }
    
    if (messages.includes('permission') || messages.includes('forbidden')) {
      throw new KibelaError(
        'Permission denied. You may not have access to this resource.',
        'PERMISSION_ERROR',
        errors
      );
    }
    
    throw new KibelaError(messages, 'GRAPHQL_ERROR', errors);
  }
  
  // Network errors
  if (error.code === 'ENOTFOUND') {
    throw new KibelaError(
      'Could not connect to Kibela. Please check your team name and internet connection.',
      'NETWORK_ERROR'
    );
  }
  
  if (error.code === 'ETIMEDOUT') {
    throw new KibelaError(
      'Request timed out. Please try again.',
      'TIMEOUT_ERROR'
    );
  }
  
  // Generic error
  throw new KibelaError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  );
}

export function displayError(error: Error | KibelaError): void {
  console.error(chalk.red('✖'), chalk.bold('Error:'), error.message);
  
  if (error instanceof KibelaError) {
    if (error.code === 'AUTH_ERROR') {
      console.error(chalk.dim('\nPlease run "kibela config" to update your credentials.'));
    } else if (error.code === 'NETWORK_ERROR') {
      console.error(chalk.dim('\nCheck your internet connection and team name.'));
    }
    
    if (process.env.DEBUG && error.details) {
      console.error(chalk.dim('\nDebug details:'));
      console.error(error.details);
    }
  }
  
  process.exit(1);
}

export function wrapAsyncCommand(fn: Function) {
  return async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        displayError(error);
      } else {
        displayError(new Error(String(error)));
      }
    }
  };
}