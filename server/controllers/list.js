const _ = require('lodash');
const Joi = require('@hapi/joi');
const InfoService = require('../services/info');
const { Utility } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { USER_STATUS } = Utility.Enumerations;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];

const schema = Joi.object({
  station_id: Joi.string().length(36).empty(['', null]),
  status: Joi.array().items(
    Joi.string().valid(...Object.values(USER_STATUS)).uppercase().required(),
  ),
}).empty(['', null]);

module.exports = async (input) => {
  const validData = validate(input.query, schema);
  const stationId = _.get(validData, 'stationId');
  const statuses = _.get(validData, 'status', []);
  let users;
  if (stationId) {
    users = await InfoService.findAllByStationIdAndStatuses(stationId, statuses);
  } else {
    users = await InfoService.findAllByStatuses(statuses);
  }

  users = Helper.scrub(users, scrubFields);
  return Helper.handleSuccess(users, 'user');
};
