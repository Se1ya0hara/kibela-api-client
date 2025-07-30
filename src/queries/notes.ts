export const CREATE_NOTE = `
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      note {
        id
        title
        content
        contentHtml
        contentUpdatedAt
        publishedAt
        url
        coediting
        author {
          id
          account
          realName
          avatarImage {
            url
          }
          url
        }
        groups {
          id
          name
        }
        folders(first: 100) {
          edges {
            node {
              id
              name
            }
          }
        }
        commentsCount
      }
    }
  }
`;

export const UPDATE_NOTE = `
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      note {
        id
        title
        content
        contentHtml
        contentUpdatedAt
        publishedAt
        url
        coediting
        author {
          id
          account
          realName
          avatarImage {
            url
          }
          url
        }
        groups {
          id
          name
        }
        folders(first: 100) {
          edges {
            node {
              id
              name
            }
          }
        }
        commentsCount
      }
    }
  }
`;

export const DELETE_NOTE = `
  mutation DeleteNote($input: DeleteNoteInput!) {
    deleteNote(input: $input) {
      note {
        id
      }
    }
  }
`;

export const GET_NOTE = `
  query GetNote($id: ID!) {
    note(id: $id) {
      id
      title
      content
      contentHtml
      contentUpdatedAt
      publishedAt
      url
      coediting
      author {
        id
        account
        realName
        avatarImage {
          url
        }
        url
      }
      groups {
        id
        name
      }
      folders(first: 100) {
        edges {
          node {
            id
            name
          }
        }
      }
      commentsCount
      comments(first: 50) {
        edges {
          node {
            id
            content
            contentHtml
            publishedAt
            author {
              id
              account
              realName
              avatarImage {
                url
              }
              url
            }
          }
        }
      }
    }
  }
`;

export const LIST_NOTES = `
  query ListNotes($first: Int, $after: String, $orderBy: NoteOrder) {
    notes(first: $first, after: $after, orderBy: $orderBy) {
      edges {
        cursor
        node {
          id
          title
          content
          contentHtml
          contentUpdatedAt
          publishedAt
          url
          coediting
          author {
            id
            account
            realName
            avatarImage {
              url
            }
            url
          }
          groups {
            id
            name
          }
          folders(first: 100) {
            edges {
              node {
                id
                name
              }
            }
          }
          commentsCount
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

export const SEARCH_NOTES = `
  query SearchNotes($query: String!, $first: Int, $after: String) {
    search(query: $query, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          url
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;

export const LIST_GROUP_NOTES = `
  query ListGroupNotes($groupId: ID!, $first: Int, $after: String, $orderBy: NoteOrder) {
    group(id: $groupId) {
      id
      name
      notes(first: $first, after: $after, orderBy: $orderBy) {
        edges {
          cursor
          node {
            id
            title
            content
            contentHtml
            contentUpdatedAt
            publishedAt
            url
            coediting
            author {
              id
              account
              realName
              avatarImage {
                url
              }
              url
            }
            folders(first: 100) {
              edges {
                node {
                  id
                  name
                }
              }
            }
            commentsCount
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
  }
`;

// Lightweight query for folder filtering (reduced cost)
export const LIST_GROUP_NOTES_LIGHT = `
  query ListGroupNotesLight($groupId: ID!, $first: Int, $after: String, $orderBy: NoteOrder) {
    group(id: $groupId) {
      id
      name
      notes(first: $first, after: $after, orderBy: $orderBy) {
        edges {
          cursor
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
            folders(first: 10) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
      }
    }
  }
`;
export const notesQueries = {
  create: CREATE_NOTE,
  update: UPDATE_NOTE,
  delete: DELETE_NOTE,
  get: GET_NOTE,
  list: LIST_NOTES,
  search: SEARCH_NOTES,
  groupNotes: LIST_GROUP_NOTES,
};
