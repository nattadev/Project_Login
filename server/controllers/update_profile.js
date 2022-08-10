const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];
const emailRegex = new RegExp(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/);

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  firstname: Joi.string().empty(['', null]),
  lastname: Joi.string().empty(['', null]),
  email: Joi.string().lowercase().regex(emailRegex).empty(['', null]),
  phone: Joi.string().allow('', null),
  employee_id: Joi.string().replace(/[_%]/g, '\\$&').allow('', null),
  editor_id: Joi.string().length(36).empty(['', null]),
}).required();

module.exports = async (input) => {
  const validData = validate(input.value, schema);
  let user = await InfoService.updateProfile(validData);
  user = Helper.scrub(user, scrubFields);
  return Helper.handleSuccess(user, 'user');
};
