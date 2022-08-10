
const { Utility, Services } = require('rpro-utility');
const { Enumerations, Logger, Graphql_schema  } = Utility;
const { GraphqlRequestService } = Services;
const { SchemaEnum } = Graphql_schema;
const { ERROR_NAME } = Enumerations;
const logger = Logger.Logger('userService');
const BaseService = require('./base');

class StationService extends BaseService {
  async addStations(input, user, context) {
    const result = user
    const stations = await GraphqlRequestService.request(SchemaEnum.USER_ADD_STATION, {
        value: { 
          user_id: input.userId,
          stations: input.stations,
        }
      }, {
        headers: { authorization: context.authorization }
      })
      .then(response => {  
        return response.data.data.StationAddByUser 
      })
      .catch(err => {
        logger.debug(err.message);
        throw new Error(`${ERROR_NAME.COMMUNICATION_ERROR}: 'service connection refused'`);
      });
    
    result.stations = stations
    return result;
  }

  async setStations(input, user, context) {
    const result = user
    const stations = await GraphqlRequestService.request(SchemaEnum.USER_SET_STATION, {
        value: { 
          user_id: input.userId,
          stations: input.stations,
        }
      }, {
        headers: { authorization: context.authorization }
      })
      .then(response => {  
        return response.data.data.StationSetByUser 
      })
      .catch(err => {
        logger.debug(err.message);
        throw new Error(`${ERROR_NAME.COMMUNICATION_ERROR}: 'service connection refused'`);
      });
    result.stations = stations
    return result;
  }
}

module.exports = new StationService();
