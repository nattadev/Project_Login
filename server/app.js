const express = require("express");
const db = require("./config/database");
const { ApolloServer } = require("apollo-server-express");
const schema = require('./schema');


async function startServer() {
  db.authenticate()
    .then(() => console.log("database connected"))
    .catch((err) => console.log("Eror : " + err));
 
    
  const app = express();
  const apolloServer = new ApolloServer({
    schema,
    
  });
   
  await apolloServer.start();

   apolloServer.applyMiddleware({ app:app , path: '/service'})



  app.listen(5050, () => console.log("Server started in port", 5050));
}

startServer();