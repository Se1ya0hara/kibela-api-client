import { z } from 'zod';

// Configuration validation
export const ConfigSchema = z.object({
  team: z.string().min(1, 'Team name is required'),
  token: z.string().min(1, 'API token is required')
});

// Note input validation
export const CreateNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  coediting: z.boolean().optional(),
  groupIds: z.array(z.string()).optional(),
  draft: z.boolean().optional()
});

export const UpdateNoteInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  coediting: z.boolean().optional(),
  groupIds: z.array(z.string()).optional(),
  draft: z.boolean().optional()
}).refine(data => data.title || data.content, {
  message: 'At least one field (title or content) must be provided'
});

// Environment variable validation
export const EnvSchema = z.object({
  KIBELA_TEAM: z.string().optional(),
  KIBELA_TOKEN: z.string().optional(),
  KIBELA_API_KEY: z.string().optional()
}).refine(data => !data.KIBELA_TOKEN || !data.KIBELA_API_KEY || data.KIBELA_TOKEN === data.KIBELA_API_KEY, {
  message: 'Both KIBELA_TOKEN and KIBELA_API_KEY are set with different values. Please use only one.'
});

// API response validation
export const NoteResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  url: z.string()
});

export const ErrorResponseSchema = z.object({
  errors: z.array(z.object({
    message: z.string(),
    extensions: z.object({
      code: z.string().optional()
    }).optional()
  }))
});

// Validation helpers
export function validateConfig(team?: string, token?: string): { isValid: boolean; error?: string } {
  const result = ConfigSchema.safeParse({ 
    team: team || '', 
    token: token || '' 
  });
  
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join(', ');
    return { isValid: false, error: errors };
  }
  
  return { isValid: true };
}

export function sanitizeToken(token: string): string {
  if (token.length <= 8) {
    return '****';
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}