export const LIST_GROUPS = `
  query ListGroups($first: Int, $after: String) {
    groups(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          description
          isPrivate
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

export const GET_GROUP = `
  query GetGroup($id: ID!) {
    group(id: $id) {
      id
      name
      description
      isPrivate
    }
  }
`;