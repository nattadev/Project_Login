const Joi = require('@hapi/joi');
const LoginService = require('../services/login');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const Security = Utility.Security;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  token: Joi.string().required(),
}).required();

module.exports = async (input) => {
  const validData = validate(input.query, schema);
  let user = await LoginService.loginRedeem(validData);

  await Security.clearRefreshToken(validData.token);
  const tokensObj = await Security.generateToken(user.id, user.role);
  user.token = tokensObj.token;
  user.refresh_token = tokensObj.refreshToken;

  user = Helper.scrub(user, scrubFields);
  return Helper.handleSuccess(user, 'user');
};
