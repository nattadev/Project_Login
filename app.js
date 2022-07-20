const express = require('express');
const mongoose = require('mongoose');
const app = express();

const UserModel = mongoose.model('users', mongoose.Schema());

const uri =
  'mongodb+srv://panda01:g0858365563@panda.lorcwxb.mongodb.net/api_login?retryWrites=true&w=majority';
mongoose
  .connect(uri)
  .then(() => console.log('connected db'))
  .catch((error) => console.log('connection failed'));

app.get('/', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json({ error: false, users });
  } catch (error) {
    console.log(error);
    res.json({ error: true, users: null });
  }
});

app.listen(5050, () => console.log('Server started in port', 5050));