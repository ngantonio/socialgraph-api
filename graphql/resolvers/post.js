const Post = require('../../models/Post')
const Auth = require('../../middlewares/auth')
const { AuthenticationError, UserInputError } = require('apollo-server');

const PostResolvers = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ created_at: -1 })
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },

    async getPost(_, { postId }) {
      
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        throw new Error(err);
      }
    }
    
  },

  Mutation: {
    async createPost(_, { body }, context) {
      // Get user from the token
      const { user } = Auth(context);
      // create post
      const newPost = new Post({
        body,
        username: user.username,
        user: user.id
      });
      // Save post
      const createdPost = await newPost.save();
      console.log(context.pubsub);
      context.pubsub.publish('NEW_POST', {
        newPost: createdPost
      });
      return createdPost;
    },

    async deletePost(_, { postId }, context) {
      // Get user from the token
      const { user } = Auth(context);

      try {
        const post = await Post.findById(postId);
        console.log(user.id, post.user);
        if (user.id !== post.user.toString()) throw new AuthenticationError("You are not authorized to do this operation")
        // delete post
        await post.delete();
        return "Post deleted successfully";
        
      } catch (error) {
        throw new Error(error);
      }
    },

    async likePost(_, { postId }, context) {
      // Get user from the token
      const { user } = Auth(context);

      // Search post
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        // if the user already has a like, when it is run again, this function generates a dislike
        if (post.likes.find(like => like.username === user.username)) {
          post.likes = post.likes.filter(like => like.username !== user.username);
        } else {
          post.likes.push({
            username: user.username
          })
        }
        await post.save();
        return post;
        
      } catch (error) {
        throw new Error(error);
      }
    },

    async createComment(_, { postId, body }, context) {
      // Get user from the token
      const { user } = Auth(context);

      // Validate user Input
      if (body.trim() === '') {
        throw new UserInputError("Empty Comment", {
          errors: {
            body: 'Comment cannot be empty'
          }
        });
      }

      // Search post
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");
        // Add comment in main position
        post.comments.unshift({
          body,
          username: user.username
        })
        // Save post update
        await post.save();
        return post;
  
      } catch (error) {
        throw new Error(error);
      }
    },

    async deleteComment(_, { postId, commentId }, context) {
      // Get user from the token
      const { user } = Auth(context);
    
      // Search post
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        /**To verify that the user who tries to delete the comment 
         * is the creator of the comment, it is necessary: 
         * */

        // 1. get the user comment id
        const commentIndex = post.comments.findIndex(c => c.id === commentId);
        
        // 2. if the username of the authenticated user is the same as the one in the comment then you can delete it
        if (post.comments[commentIndex].username === user.username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("You are not authorized to do this operation")
        }
      } catch (error) {
        throw new Error(error);
      }
    },

  },

  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
};

module.exports = PostResolvers;


/**
 * mutation {
  createPost(body: "This is a test post") {
    id
    body
    username
    created_at
  }
}
 */