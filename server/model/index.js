const { CommonBaseModel } = require('rpro-utility');
const database = require('./entities');

class User extends CommonBaseModel { }

module.exports = new User({
  schema: database.Users,
  table: 'users',
  unique: ['username'],
  scrub: [],
});
