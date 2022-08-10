const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const integerRegex = new RegExp(/^[0-9]*$/);

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  t_otp: Joi.string().length(6).regex(integerRegex).required(),
}).required();

module.exports = async (input) => {
  const validData = validate(input.query, schema);
  const tOtpValidate = await InfoService.verifyTOtp(validData);
  return Helper.handleSuccess(tOtpValidate, 'user');
};
