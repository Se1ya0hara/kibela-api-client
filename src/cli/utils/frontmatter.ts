export function generateFrontmatter(note: any): string {
  const frontmatter: any = {
    id: note.id,
    title: note.title,
    coediting: note.coediting || false,
    published: note.publishedAt ? true : false,
  };

  // Add groups if available
  try {
    if (note.groups?.edges && note.groups.edges.length > 0) {
      frontmatter.groups = note.groups.edges.map((edge: any) => edge.node?.id).filter(Boolean);
    }
  } catch (e) {
    // Skip if groups data is malformed
  }

  // Add folders if available
  try {
    if (note.folders?.edges && note.folders.edges.length > 0) {
      frontmatter.folders = note.folders.edges
        .filter((edge: any) => edge.node?.name)
        .map((edge: any) => ({
          groupId: edge.node?.group?.id || 'unknown',
          folderName: edge.node.name
        }));
    }
  } catch (e) {
    // Skip if folders data is malformed
  }

  // Add author if available
  if (note.author?.account) {
    frontmatter.author = note.author.account;
  }

  // Add timestamps
  if (note.publishedAt) {
    frontmatter.createdAt = note.publishedAt;
  }
  if (note.contentUpdatedAt) {
    frontmatter.updatedAt = note.contentUpdatedAt;
  }

  // Add URL
  if (note.url) {
    frontmatter.url = note.url;
  }

  // Convert to YAML format
  const yamlLines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      
      yamlLines.push(`${key}:`);
      value.forEach((item: any) => {
        if (typeof item === 'object') {
          yamlLines.push(`  - ${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
        } else {
          yamlLines.push(`  - ${item}`);
        }
      });
    } else if (typeof value === 'boolean') {
      yamlLines.push(`${key}: ${value}`);
    } else {
      yamlLines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  yamlLines.push('---');
  
  return yamlLines.join('\n');
}

export function sanitizeFileName(title: string): string {
  // Remove or replace characters that are invalid in file names
  return title
    .replace(/\.(md|markdown)$/i, '')  // Remove .md or .markdown extension if present
    .replace(/[<>:"/\\|?*]/g, '-')     // Replace invalid characters with hyphen
    .replace(/\s+/g, '_')              // Replace spaces with underscore
    .replace(/^\.+/, '')               // Remove leading dots
    .replace(/\.+$/, '')               // Remove trailing dots
    .trim()
    .slice(0, 200);                    // Limit length to avoid filesystem issues
}