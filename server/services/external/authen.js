const _ = require('lodash');
const axios = require('axios');
const { Utility } = require('rpro-utility');
const { Logger, Security } = Utility;
const config = require('@root/config').getInstance().get();
const logger = Logger.Logger('userService');

class AuthService {
  async authenticate(headers) {
    return await axios
      .post(`${config.authService.url}/authenticate`, {}, { headers })
      .then((response) => response.data)
      .catch((error) => logger.error(error));
  }
  async ackAuth(headers) {
    let result;
    const [type, token] = _.get(headers, 'authorization', '').split(' ');
    if (type.toUpperCase() === 'BASIC' && token)
      result = Security.verifyAck(token);
    return result;
  }
}

module.exports = new AuthService();
