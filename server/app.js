const express = require("express");
const db = require("./config/database");
const { ApolloServer, gql } = require("apollo-server-express");
const schema = require('./schema/schema');
const resolver = require('./schema/resolver')




async function startServer() {
  db.authenticate()
    .then(() => console.log("database connected"))
    .catch((err) => console.log("Eror : " + err));

  const app = express();
  const apolloServer = new ApolloServer({
    schema,
    resolver,
  });

  await apolloServer.start();

   apolloServer.applyMiddleware({ app:app , path: '/users'})

   app.use((req, res) => {
    res.json('hello')
   } )

  app.listen(5050, () => console.log("Server started in port", 5050));
}

startServer();