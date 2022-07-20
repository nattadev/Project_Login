const express = require('express');
const mongoose = require('mongoose');
const app = express();



const uri =
  'mongodb+srv://panda01:g0858365563@panda.lorcwxb.mongodb.net/api_login?retryWrites=true&w=majority';
mongoose
  .connect(uri)
  .then(() => console.log('connected db'))
  .catch((error) => console.log('connection failed'));
  app.use(express.json())

const usersRouter = require('./routes/auth')

app.use('/',usersRouter)


app.listen(5050, () => console.log('Server started in port', 5050));