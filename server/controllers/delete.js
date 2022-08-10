const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { ERROR_NAME } = Utility.Enumerations;

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  editor_id: Joi.string().length(36).required(),
}).required();

module.exports = async (input) => {
  const validData = validate(input.value, schema);
  const user = await InfoService.delete(validData);

  if (!user) {
    throw new Error(`${ERROR_NAME.INVALID_REQUEST}: 'user cannot be deleted'`);
  }
  return Helper.handleSuccess(true, 'user');
};
