const _ = require('lodash');
const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
}).required();

module.exports = async (input) => {
  const validData = validate(input.query, schema);
  const secret = await InfoService.getSecret(_.get(validData, 'userId'));
  return Helper.handleSuccess(secret, 'user');
};
