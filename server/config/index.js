require('dotenv').config();
const _ = require('lodash');

module.exports = (() => {
  let instance;

  const init = () => {
    const envConfig = require('./settings');
    const mainConfig = require('./settings.default');
    const config = _.merge(mainConfig, envConfig);
    return { get: () => config };
  };

  return {
    getInstance: () => {
      if (!instance) { instance = init(); }
      return instance;
    },
  };
})();