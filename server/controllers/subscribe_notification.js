const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;

const schema = Joi.object({
  user_id: Joi.string().uuid({ version: ['uuidv4'] }).required(),
  player_id: Joi.string().uuid({ version: ['uuidv4'] }).required(),
}).required();

module.exports = async (input) => {
  const validData = validate(input.value, schema);
  const result = await InfoService.addPlayerId(validData);
  return Helper.handleSuccess(result, 'user');
};
