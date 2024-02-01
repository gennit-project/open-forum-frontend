import { gql } from "@apollo/client/core";
import { AUTHOR_FIELDS } from "../discussion/queries";

const COMMENT_VOTE_FIELDS = gql`
  fragment CommentVoteFields on Comment {
    UpvotedByUsers {
      username
    }
    UpvotedByUsersAggregate {
      count
    }
    DownvotedByModerators {
      displayName
    }
    DownvotedByModeratorsAggregate {
      count
    }
  }
`;

const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    id
    text
    emoji
    weightedVotesCount
    createdAt
    updatedAt
    CommentAuthor {
      ...AuthorFields
    }
    ChildCommentsAggregate {
      count
    }
    ParentComment {
      id
    }
    ...CommentVoteFields
  }
  ${AUTHOR_FIELDS}
`;

export const GET_DISCUSSION_COMMENTS = gql`
  query getCommentSection(
    $channelUniqueName: String!
    $discussionId: ID!
    $offset: Int
    $limit: Int
    $sort: String
  ) {
    getCommentSection(
      channelUniqueName: $channelUniqueName
      discussionId: $discussionId
      offset: $offset
      limit: $limit
      sort: $sort
    ) {
      DiscussionChannel {
        id
        weightedVotesCount
        discussionId
        channelUniqueName
        emoji
        Channel {
          uniqueName
        }
        Discussion {
          id
          title
          Author {
            ...AuthorFields
          }
        }
        CommentsAggregate {
          count
        }
        UpvotedByUsers {
          username
        }
        UpvotedByUsersAggregate {
          count
        }
        DownvotedByModerators {
          displayName
        }
        DownvotedByModeratorsAggregate {
          count
        }
      }
      Comments {
        ...CommentFields
        ChildComments {
          id
          text
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_EVENT_COMMENTS = gql`
  query getEventComments(
    $eventId: ID!
    $offset: Int
    $limit: Int
    $sort: SortType
  ) {
    getEventComments(
      eventId: $eventId
      offset: $offset
      limit: $limit
      sort: $sort
    ) {
      Event {
        id
        title
        description
        startTime
        endTime
        locationName
        address
        virtualEventUrl
        startTimeDayOfWeek
        startTimeHourOfDay
        canceled
        isHostedByOP
        isAllDay
        coverImageURL
        createdAt
        updatedAt
        placeId
        isInPrivateResidence
        location {
          latitude
          longitude
        }
        cost
      }
      Comments {
        ...CommentFields
        ChildComments {
          id
          text
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_DISCUSSION_CHANNEL_BY_ID = gql`
  query getDiscussionChannel($id: ID!) {
    discussionChannels(where: { id: $id }) {
      id
      weightedVotesCount
      discussionId
      channelUniqueName
      Channel {
        uniqueName
      }
      Discussion {
        id
        title
        Author {
          ...AuthorFields
        }
      }
      CommentsAggregate {
        count
      }
      UpvotedByUsersAggregate {
        count
      }
      Comments(where: { isRootComment: true }) {
        ...CommentFields
        ChildComments {
          ...CommentFields
        }
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_DISCUSSION_CHANNEL_ROOT_COMMENT_AGGREGATE = gql`
  query getDiscussionChannelRootCommentAggregate(
    $channelUniqueName: String!
    $discussionId: ID!
  ) {
    discussionChannels(
      where: {
        channelUniqueName: $channelUniqueName
        discussionId: $discussionId
      }
    ) {
      id
      CommentsAggregate(where: { isRootComment: true }) {
        count
      }
    }
  }
`;

export const GET_EVENT_ROOT_COMMENT_AGGREGATE = gql`
  query getEventRootCommentAggregate($eventId: ID!) {
    events(where: { id: $eventId }) {
      id
      CommentsAggregate(where: { isRootComment: true }) {
        count
      }
    }
  }
`;

export const GET_COMMENT_AND_REPLIES = gql`
  query getCommentWithReplies($id: ID!) {
    comments(where: { id: $id }) {
      ...CommentFields
      ChildComments {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_COMMENT_REPLIES = gql`
  query getCommentWithReplies($commentId: ID!, $limit: Int, $offset: Int, $sort: SortType) {
    getCommentReplies (
      commentId: $commentId
      limit: $limit
      offset: $offset
      sort: $sort
    ) {
      aggregateChildCommentCount
      ChildComments {
        ...CommentFields
      }
    }
  }
  ${AUTHOR_FIELDS}
  ${COMMENT_FIELDS}
  ${COMMENT_VOTE_FIELDS}
`;

export const GET_FEEDBACK_ON_COMMENT = gql`
query getFeedbackOnComment {
  comments(
    where: {
      id: "d1bfb14f-e3f5-453b-9c7c-96d36cdd3fc9"
    }
  ) {
    text
    FeedbackComments {
      text
      CommentAuthor {
        ... on ModerationProfile {
          displayName
        }
      }
    }
  }
}

`