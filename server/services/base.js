const _ = require('lodash');

class BaseService {
  flatten(obj) {
    return Object.keys(obj).reduce((value, key) => {
      const data = _.cloneDeep(value);
      if (key === 'stationCatalog') {
        data.type = _.get(obj[key], 'type');
        data.subTypes = _.get(obj[key], 'subTypes');
      }
      if (key === 'layout') {
        data[key] = obj[key];
        const conf = _.isNil(_.get(data[key], 'configuration')) ? null : JSON.stringify(data[key].configuration);
        _.set(data[key], 'configuration', conf);
      }
      if (key === 'homeLayout') {
        data[key] = obj[key];
        const conf = _.isNil(_.get(data[key], 'configuration')) ? null : JSON.stringify(data[key].configuration);
        _.set(data[key], 'configuration', conf);
      }
      if (key === 'station_users') {
        data.group = obj[key].group;
      } else if (Array.isArray(obj[key]) && (typeof _.get(obj[key], '[0]') === 'object')) {
        obj[key].forEach((item) => {
          (data[key] || (data[key] = [])).push(flatten(item));
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null
          && obj[key] !== undefined && !(obj[key] instanceof Date)
          && !Array.isArray(obj[key])) {
        data[key] = flatten(obj[key]);
      } else {
        data[key] = obj[key];
      }
      return data;
    }, {});
  }
}

module.exports = BaseService;
