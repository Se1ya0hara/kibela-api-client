// Folder-specific queries

export const LIST_FOLDERS = `
  query ListFolders($first: Int!, $after: String) {
    folders(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          path
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;

export const GET_FOLDER = `
  query GetFolder($id: ID!) {
    folder(id: $id) {
      id
      name
      path
      notes(first: 100) {
        edges {
          node {
            id
            title
            contentUpdatedAt
            url
            author {
              id
              account
              realName
            }
          }
        }
        totalCount
      }
    }
  }
`;

export const LIST_ALL_NOTE_FOLDERS = `
  query GetNoteFolders($noteId: ID!) {
    note(id: $noteId) {
      id
      title
      folders(first: 100) {
        edges {
          node {
            id
            name
            path
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;