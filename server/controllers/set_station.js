const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const StationService = require('../services/station');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { STATION_USER_GROUP } = Utility.Enumerations;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  stations: Joi.array().items(Joi.object().keys({
    id: Joi.string().length(36).required(),
    group: Joi.string().valid(...Object.values(STATION_USER_GROUP)).uppercase().required(),
  })).required(),
  editor_id: Joi.string().length(36).empty(['', null]),
}).required();

module.exports = async (input, context) => {
  const validData = validate(input.value, schema);
  const user = await InfoService.findById(validate.user_id);
  if(!user) {
    throw new Error(`${ERROR_NAME.INVALID_REQUEST}: 'user not found'`);
  }
  let result = await StationService.setStations(validData, user, context);
  result = Helper.scrub(result, scrubFields);
  return Helper.handleSuccess(result, 'user');
};
