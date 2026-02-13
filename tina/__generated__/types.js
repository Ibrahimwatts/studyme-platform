export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const VideosPartsFragmentDoc = gql`
    fragment VideosParts on Videos {
  __typename
  title
  subject
  form
  youtube_id
  duration
  description
}
    `;
export const NotesPartsFragmentDoc = gql`
    fragment NotesParts on Notes {
  __typename
  title
  subject
  form
  body
}
    `;
export const ClassesPartsFragmentDoc = gql`
    fragment ClassesParts on Classes {
  __typename
  subject
  time
  topic
  link
  description
}
    `;
export const VideosDocument = gql`
    query videos($relativePath: String!) {
  videos(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...VideosParts
  }
}
    ${VideosPartsFragmentDoc}`;
export const VideosConnectionDocument = gql`
    query videosConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: VideosFilter) {
  videosConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...VideosParts
      }
    }
  }
}
    ${VideosPartsFragmentDoc}`;
export const NotesDocument = gql`
    query notes($relativePath: String!) {
  notes(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...NotesParts
  }
}
    ${NotesPartsFragmentDoc}`;
export const NotesConnectionDocument = gql`
    query notesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: NotesFilter) {
  notesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...NotesParts
      }
    }
  }
}
    ${NotesPartsFragmentDoc}`;
export const ClassesDocument = gql`
    query classes($relativePath: String!) {
  classes(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ClassesParts
  }
}
    ${ClassesPartsFragmentDoc}`;
export const ClassesConnectionDocument = gql`
    query classesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ClassesFilter) {
  classesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ClassesParts
      }
    }
  }
}
    ${ClassesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    videos(variables, options) {
      return requester(VideosDocument, variables, options);
    },
    videosConnection(variables, options) {
      return requester(VideosConnectionDocument, variables, options);
    },
    notes(variables, options) {
      return requester(NotesDocument, variables, options);
    },
    notesConnection(variables, options) {
      return requester(NotesConnectionDocument, variables, options);
    },
    classes(variables, options) {
      return requester(ClassesDocument, variables, options);
    },
    classesConnection(variables, options) {
      return requester(ClassesConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
