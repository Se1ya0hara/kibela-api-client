export const LIST_USERS = `
  query ListUsers($first: Int, $after: String) {
    users(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          account
          realName
          avatarImage {
            url
          }
          url
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

export const GET_CURRENT_USER = `
  query GetCurrentUser {
    currentUser {
      id
      account
      realName
      avatarImage {
        url
      }
      url
    }
  }
`;