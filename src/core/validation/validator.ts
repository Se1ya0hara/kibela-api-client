export type ValidationRule<T> = (value: T) => string | null;

export interface Schema {
  [key: string]: SchemaField;
}

export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  items?: SchemaField;
  properties?: Schema;
  validate?: ValidationRule<any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  static validate(data: any, schema: Schema): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors = this.validateField(field, value, rules);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  private static validateField(
    field: string,
    value: any,
    rules: SchemaField
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      return errors;
    }

    // Skip validation if value is not present and not required
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push({ field, message: `${field} must be of type ${rules.type}` });
      return errors;
    }

    // String validations
    if (rules.type === 'string') {
      if (rules.min && value.length < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
      }
      if (rules.max && value.length > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max} characters` });
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: `${field} format is invalid` });
      }
    }

    // Number validations
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min}` });
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max}` });
      }
    }

    // Array validations
    if (rules.type === 'array') {
      if (rules.min && value.length < rules.min) {
        errors.push({ field, message: `${field} must have at least ${rules.min} items` });
      }
      if (rules.max && value.length > rules.max) {
        errors.push({ field, message: `${field} must have at most ${rules.max} items` });
      }
      if (rules.items) {
        value.forEach((item: any, index: number) => {
          const itemErrors = this.validateField(`${field}[${index}]`, item, rules.items!);
          errors.push(...itemErrors);
        });
      }
    }

    // Object validations
    if (rules.type === 'object' && rules.properties) {
      const objErrors = this.validate(value, rules.properties);
      errors.push(...objErrors.map(e => ({ 
        field: `${field}.${e.field}`, 
        message: e.message 
      })));
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
    }

    // Custom validation
    if (rules.validate) {
      const error = rules.validate(value);
      if (error) {
        errors.push({ field, message: error });
      }
    }

    return errors;
  }

  static isValid(data: any, schema: Schema): boolean {
    return this.validate(data, schema).length === 0;
  }

  static assertValid(data: any, schema: Schema): void {
    const errors = this.validate(data, schema);
    if (errors.length > 0) {
      const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
  }
}