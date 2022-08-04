const _ = require('lodash');
const User = require('../model');
const moment = require('moment');
const Sequelize = require('sequelize');
const { Utility } = require('rpro-utility');
const BaseService = require('./base');

const { Security, Redis, Enumerations } = Utility;
const { USER_STATUS, ERROR_NAME } = Enumerations;
const sequelize = Utility.Sequelize.getInstance().getConnection();
const redisClient = Redis.getInstance().getClient();
const ISOLATION = { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ };
const LOCKED_TIMEOUT = 15; // 15 mins
const ACTIVE_STATUS = [USER_STATUS.ACTIVE, USER_STATUS.LOCKED];

class LoginService extends BaseService {
  async login(input) {
    let error;
    let result;
    const filter = { username: input.username, status: ACTIVE_STATUS };
    const data = { loggedInTimestamp: Date.now() };
    const instance = await User.findOne({ filter });
    if (instance) {
      const userId = instance.get('id');
      const status = instance.get('status');
      const lastLogin = moment(instance.get('loggedInTimestamp'));
      const loginTimes = instance.get('loggedInCount');
      const hash = instance.get('hash');

      if (moment().diff(lastLogin, 'seconds') > LOCKED_TIMEOUT * 60
        || status === USER_STATUS.ACTIVE) {
        if (!Security.matchPassword(input.password, hash)) {
          if (status === USER_STATUS.LOCKED) {
            data.loggedInCount = 1;
          } else if (loginTimes < 3) {
            data.loggedInCount = loginTimes + 1;
          }
          data.status = (data.loggedInCount >= 3) ? USER_STATUS.LOCKED : USER_STATUS.ACTIVE;
          error = (data.status === USER_STATUS.LOCKED)
            ? `${ERROR_NAME.UNAUTHORIZED}: account was locked`
            : `${ERROR_NAME.UNAUTHORIZED}: password is incorrect`;
        } else {
          data.loggedInCount = 0;
          data.status = USER_STATUS.ACTIVE;
        }
        data.loggedInTimestamp = Date.now();
        let user;
        const transaction = await 
        sequelize.transaction(ISOLATION);
        try {
          user = await User.updateOne({
            filter,
            data,
            userId,
            transaction,
          });
          await transaction.commit();
        } catch (err) {
          await transaction.rollback();
          throw err;
        }
        result = User.getObjectFromInstance(user);
        result = super.flatten(result); 
      } else {
        throw new Error(`${ERROR_NAME.UNAUTHORIZED}: account was locked`);
      }
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: user not found`);
    }
    if (error) throw new Error(error);
    return result;
  }

  async loginRedeem(input) {
    let error;
    let result;
    const idFromToken = await redisClient.get(input.token);
    if (idFromToken) {
      const filter = { id: idFromToken, status: ACTIVE_STATUS };
      const instance = await User.findOne({ filter });
      if (instance) {
        result = User.getObjectFromInstance(instance);
        result = super.flatten(result);
      } else {
        throw new Error(`${ERROR_NAME.INVALID_REQUEST}: user not found`);
      }
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: token is not found or expired in redis`);
    }
    if (error) throw new Error(error);
    return result;
  }
}

module.exports = new LoginService();