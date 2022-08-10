const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const emailRegex = new RegExp(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/);

const schema = Joi.object({
  username: Joi.string().replace(/[_%]/g, '\\$&'),
  email: Joi.string().lowercase().regex(emailRegex),
  employee_id: Joi.string().replace(/[_%]/g, '\\$&'),
}).oxor('username', 'email', 'employee_id').required();

module.exports = async (input) => {
  const validData = validate(input.query, schema);
  const boolean = await InfoService.validateDuplicateProfile(validData);
  return Helper.handleSuccess(boolean, 'user');
};
