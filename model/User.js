const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name:  { type: String,required: true, trim: true},
    email: { type: String, required: true, trim: true, unique: true, index: true },
    password: { type: String, required: true, trim: true , minlength: 3 },
    role: { type: String, default: 'member' }
  },{
    collection: 'users'
  });

  const UserModel = mongoose.model('User', schema);
module.exports = UserModel