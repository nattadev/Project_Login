const _ = require('lodash');
const UserLogin = require('../controller/login');


const resolver = {
  Query: {

    UserLogin: (root, args, ctx, ...funcArgs) => {
      const data = { query: _.merge(args.query, funcArgs[0].authorize) };
      return UserLogin(data);
    },
  }
}


module.exports = resolver;
