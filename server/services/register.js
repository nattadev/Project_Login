const _ = require('lodash');
const uuid = require('uuid');
const generator = require('generate-password');
const { Op } = require('sequelize');
const User = require('../model');
const { Utility } = require('rpro-utility');
const BaseService = require('./base');

const { Security, Enumerations, Regex} = Utility;
const { USER_ROLE, USER_STATUS, ERROR_NAME } = Enumerations;
const { escapeCharacters } = Regex;

class RegisterService extends BaseService {
  _fields = ['firstname', 'lastname', 'username', 'email',
  'employeeId', 'phone', 'status', 'layoutId', 'homeLayoutId'];
  EXISTING_STATUS = [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.LOCKED];

  async register(input) {
    let result, filter;
    const data = _.omitBy(_.pick(input, this._fields), _.isNil);

    if (_.get(data, 'employeeId')) {
      filter = {
        [Op.or]: [
          { username: { [Op.iLike]: await escapeCharacters(_.get(data, 'username')) } },
          { email: { [Op.iLike]: await escapeCharacters(_.get(data, 'email')) } },
          { employeeId: { [Op.iLike]: await escapeCharacters(_.get(data, 'employeeId')) } },
        ],
        status: this.EXISTING_STATUS,
      };
    } else {
      filter = {
        [Op.or]: [
          { username: { [Op.iLike]: await escapeCharacters(_.get(data, 'username')) } },
          { email: { [Op.iLike]: await escapeCharacters(_.get(data, 'email')) } },
        ],
        status: this.EXISTING_STATUS,
      };
    }

    const users = await User.findAll({ filter });

    if (_.isEmpty(users)) {
      const password = _.get(input, 'password', generator.generate({
        length: 10,
        numbers: true,
        uppercase: true,
        strict: true,
        excludeSimilarCharacters: true,
      }));

      data.id = uuid.v4();
      data.hash = Security.hashPassword(password);
      data.loggedInCount = 0;
      data.loggedInTimestamp = Date.now();
      data.latestResetTimestamp = Date.now();
      data.role = input.isAdmin ? USER_ROLE.SUPER_ADMIN : USER_ROLE.USER;
      data.status = USER_STATUS.ACTIVE;
      data.queryNotificationTimestamp = Date.now();

      const editorId = input.editorId || data.id;
      const instance = await User.save({ data, userId: editorId });
      result = User.getObjectFromInstance(instance);
      result = { user:super.flatten(result), password }
    } else {
      users.forEach((user) => {
        if (_.get(input, 'username').toUpperCase() === user.get('username').toUpperCase()) {
          throw new Error(`${ERROR_NAME.INVALID_REQUEST}: username was duplicated`);
        } else if (_.get(input, 'email').toUpperCase() === user.get('email').toUpperCase()) {
          throw new Error(`${ERROR_NAME.INVALID_REQUEST}: email was duplicated`);
        } else if (_.get(input, 'employeeId') && !_.isNull(user.get('employeeId') || null)) {
          if (_.get(input, 'employeeId', '').toUpperCase() === user.get('employeeId').toUpperCase()) {
            throw new Error(`${ERROR_NAME.INVALID_REQUEST}: employee_id was duplicated`);
          }
        }
      });
    }
    return result
  }
}

module.exports = new RegisterService();
