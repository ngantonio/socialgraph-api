const PostResolvers = require('./post');
const UserResolvers = require('./user');

const combineResolvers = {
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...PostResolvers.Query,
  },
  Mutation: {
    ...UserResolvers.Mutation,
    ...PostResolvers.Mutation
  },
  Subscription: {
    ...PostResolvers.Subscription
  }
}

module.exports = combineResolvers;