const Joi = require('@hapi/joi');
const { Utility } = require('rpro-utility');
const UserService = require('../services/login');

const { Helper, Validate, Security } = Utility;
const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
}).required();

module.exports = async (input) => {
  const validData = Validate(input.query, schema);
  let user = await UserService.login(validData);
  const tokensObj = await Security.generateToken(user.id, user.role);
  user.token = tokensObj.token;
  user.refresh_token = tokensObj.refreshToken;

  user = Helper.scrub(user, scrubFields);
  return Helper.handleSuccess(user, 'user');
};
