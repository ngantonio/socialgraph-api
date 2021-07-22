const { ApolloServer } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions');
const mongoose = require('mongoose');

const { MONGODB_URI } = require('./config');

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  /*cors: {
    credentials: true,
    origin: true,
  },*/
  //playground: { endpoint: "/dev/graphql" },
  context: ({ req }) => ({ req, pubsub }),
})




mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    console.log("MongoDB connected");
    return server.listen({ port: 5000 });
  })
  .then(res => {
    console.log(`Server running at ${res.url}`);
  }).catch((err) => {
    console.log("server initialized error");
    console.log(err);
  })