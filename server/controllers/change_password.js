const Joi = require('@hapi/joi');
const PasswordService = require('../services/password');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { ERROR_NAME } = Utility.Enumerations;

const passwordRegex = new RegExp(/^(?=.*[A-Z]).{6,}$/);

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  new_pwd: Joi.string().regex(passwordRegex).required(),
  old_pwd: Joi.string().required(),
  editor_id: Joi.string().length(36).empty(['', null]),
}).required();

module.exports = async (input) => {
  const validData = validate(input.value, schema);
  const { user } = await PasswordService.changePassword(validData);

  if (!user) {
    throw new Error(`${ERROR_NAME.INVALID_REQUEST}: 'password cannot be changed'`);
  }
  return Helper.handleSuccess(true, 'user');
};
