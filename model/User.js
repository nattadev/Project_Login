const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : String,
    email :  String,
    passwoed :  String
})

const User = mongoose.model('Users',userSchema)
module.exports = User