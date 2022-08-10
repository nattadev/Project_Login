const _ = require('lodash');
const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  full_name: Joi.string().replace(/[_%]/g, '\\$&').required(),
}).required();

module.exports = async (fullNameInput) => {
  const validData = validate(fullNameInput.query, schema);
  const fullName = _.get(validData, 'fullName');
  let users = await InfoService.suggest(fullName);
  users = Helper.scrub(users, scrubFields);
  return Helper.handleSuccess(users, 'user');
};
