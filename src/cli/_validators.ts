import { Validator, Schema } from '../core/validation/validator';

// Configuration validation
export const ConfigSchema: Schema = {
  team: {
    type: 'string',
    required: true,
    min: 1,
    validate: (value) => value.trim() === '' ? 'Team name is required' : null,
  },
  token: {
    type: 'string',
    required: true,
    min: 1,
    validate: (value) => value.trim() === '' ? 'API token is required' : null,
  },
};

// Note input validation
export const CreateNoteInputSchema: Schema = {
  title: {
    type: 'string',
    required: true,
    min: 1,
    validate: (value) => value.trim() === '' ? 'Title is required' : null,
  },
  content: {
    type: 'string',
    required: true,
    min: 1,
    validate: (value) => value.trim() === '' ? 'Content is required' : null,
  },
  coediting: {
    type: 'boolean',
    required: false,
  },
  groupIds: {
    type: 'array',
    required: false,
    items: { type: 'string' },
  },
  draft: {
    type: 'boolean',
    required: false,
  },
};

export const UpdateNoteInputSchema: Schema = {
  title: {
    type: 'string',
    required: false,
    min: 1,
  },
  content: {
    type: 'string',
    required: false,
    min: 1,
  },
  coediting: {
    type: 'boolean',
    required: false,
  },
  groupIds: {
    type: 'array',
    required: false,
    items: { type: 'string' },
  },
  draft: {
    type: 'boolean',
    required: false,
  },
};

// Environment variable validation
export const EnvSchema: Schema = {
  KIBELA_TEAM: {
    type: 'string',
    required: false,
  },
  KIBELA_TOKEN: {
    type: 'string',
    required: false,
  },
};

// API response validation
export const NoteResponseSchema: Schema = {
  id: {
    type: 'string',
    required: true,
  },
  title: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
    required: true,
  },
  url: {
    type: 'string',
    required: true,
  },
};

export const ErrorResponseSchema: Schema = {
  errors: {
    type: 'array',
    required: true,
    items: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          required: true,
        },
        extensions: {
          type: 'object',
          required: false,
          properties: {
            code: {
              type: 'string',
              required: false,
            },
          },
        },
      },
    },
  },
};

// Validation helpers
function createValidationHelper<T extends Schema>(schema: T) {
  return (data: any): { isValid: boolean; error?: string } => {
    const errors = Validator.validate(data, schema);
    
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join(', ');
      return { isValid: false, error: errorMessages };
    }
    
    return { isValid: true };
  };
}

export function validateConfig(team?: string, token?: string): { isValid: boolean; error?: string } {
  return createValidationHelper(ConfigSchema)({ team: team || '', token: token || '' });
}

export function validateUpdateNoteInput(data: any): { isValid: boolean; error?: string } {
  // Additional validation: at least one field must be provided
  if (!data.title && !data.content && data.coediting === undefined && 
      !data.groupIds && data.draft === undefined) {
    return { isValid: false, error: 'At least one field must be provided' };
  }
  
  return createValidationHelper(UpdateNoteInputSchema)(data);
}

export function validateEnv(env: any): { isValid: boolean; error?: string } {
  return createValidationHelper(EnvSchema)(env);
}

export function sanitizeToken(token: string): string {
  if (token.length <= 8) {
    return '****';
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}