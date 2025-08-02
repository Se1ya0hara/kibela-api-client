export interface FrontMatter {
  id?: string;
  title: string;
  coediting?: boolean;
  published?: boolean;
  groups?: string[];
  folders?: Array<{
    groupId: string;
    folderName: string;
  }>;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
  [key: string]: any;
}

export interface ParsedDocument {
  frontMatter: FrontMatter;
  content: string;
}

export class FrontMatterParser {
  static parse(text: string): ParsedDocument {
    const lines = text.split('\n');
    
    if (lines[0] !== '---') {
      // No front matter
      return {
        frontMatter: { title: '' },
        content: text,
      };
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      // Invalid front matter
      return {
        frontMatter: { title: '' },
        content: text,
      };
    }

    const yamlContent = lines.slice(1, endIndex).join('\n');
    const frontMatter = this.parseYaml(yamlContent);
    const content = lines.slice(endIndex + 1).join('\n').trim();

    return { frontMatter, content };
  }

  static stringify(document: ParsedDocument): string {
    const yaml = this.stringifyYaml(document.frontMatter);
    return `---\n${yaml}---\n\n${document.content}`;
  }

  private static parseYaml(yaml: string): FrontMatter {
    const result: any = { title: '' };
    const lines = yaml.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (key === 'groups' || key === 'folders') {
        // Handle arrays
        result[key] = this.parseYamlArray(value);
      } else if (key === 'coediting' || key === 'published') {
        // Handle booleans
        result[key] = value === 'true';
      } else {
        // Handle strings
        result[key] = this.unquoteString(value);
      }
    }

    return result as FrontMatter;
  }

  private static stringifyYaml(frontMatter: FrontMatter): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(frontMatter)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        
        if (key === 'folders' && value[0] && typeof value[0] === 'object') {
          // Handle folders array with objects
          lines.push(`${key}:`);
          for (const folder of value) {
            lines.push(`  - groupId: ${this.quoteString(folder.groupId)}`);
            lines.push(`    folderName: ${this.quoteString(folder.folderName)}`);
          }
        } else {
          // Handle simple arrays
          lines.push(`${key}:`);
          for (const item of value) {
            lines.push(`  - ${this.quoteString(String(item))}`);
          }
        }
      } else if (typeof value === 'boolean') {
        lines.push(`${key}: ${value}`);
      } else {
        lines.push(`${key}: ${this.quoteString(String(value))}`);
      }
    }

    return lines.join('\n') + '\n';
  }

  private static parseYamlArray(value: string): any[] {
    // Simple array parsing - this is a basic implementation
    if (value.startsWith('[') && value.endsWith(']')) {
      const content = value.slice(1, -1);
      return content.split(',').map(item => this.unquoteString(item.trim()));
    }
    return [];
  }

  private static quoteString(str: string): string {
    // Quote if contains special characters
    if (str.includes(':') || str.includes('#') || str.includes('\n') || 
        str.includes('"') || str.includes("'") || str.startsWith(' ') || 
        str.endsWith(' ')) {
      return `"${str.replace(/"/g, '\\"')}"`;
    }
    return str;
  }

  private static unquoteString(str: string): string {
    if ((str.startsWith('"') && str.endsWith('"')) ||
        (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  }
}