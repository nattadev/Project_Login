const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');

const { Helper, Validate } = Utility;
const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  user_id: Joi.string().length(36).empty(['', null]),
}).empty(['', null]);

module.exports = async (input) => {
  const validData = Validate(input.query, schema);
  let users = await InfoService.findById(validData.userId);

  users = Helper.scrub(users, scrubFields);
  return Helper.handleSuccess(users, 'user');
};
