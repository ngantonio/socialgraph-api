const { createServer } = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { ApolloServer } = require("apollo-server-express");

const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");


const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')


const PORT = 5000;
const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  context: ({ req }) => ({ req })
});


async function start() {

  await server.start();
  server.applyMiddleware({ app, path:"/" });

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath}
  );

  mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
  .then(() => {
    console.log("MongoDB connected");
    return httpServer.listen({ port: 5000 });
  })
    .then(res => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`);
    })
    .catch((err) => {
    console.log("server initialized error");
    console.log(err);
  })

}

start();








/*const { ApolloServer } = require('apollo-server');
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
  },
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
  })*/