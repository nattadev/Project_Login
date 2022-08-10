const _ = require('lodash');
const Sequelize = require('sequelize');
const generator = require('generate-password');
const User = require('../model');
const BaseService = require('./base');
const { Utility } = require('rpro-utility');
const { Security, Enumerations } = Utility;
const sequelize = Utility.Sequelize.getInstance().getConnection();
const {
  USER_STATUS,
  STATUS, ERROR_NAME
} = Enumerations;

const ACTIVE_STATUS = [USER_STATUS.ACTIVE, USER_STATUS.LOCKED];
const ISOLATION = { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ };

class PasswordService extends BaseService {
  async changePassword(input) {
    let result;
    const filter = {
      id: input.userId,
      status: ACTIVE_STATUS,
    };
    const instance = await User.findOne({ filter });
    if (instance) {
      const oldHash = instance.get('hash');
      if (input.oldPwd && !Security.matchPassword(input.oldPwd, oldHash)) {
        throw new Error(`${ERROR_NAME.INVALID_REQUEST}: password is incorrect`);
      }
      const password = input.newPwd || generator.generate({
        length: 10,
        numbers: true,
        uppercase: true,
        strict: true,
        excludeSimilarCharacters: true,
      });
      const data = {
        loggedInCount: 0,
        latestResetTimestamp: Date.now(),
        hash: Security.hashPassword(password),
        status: STATUS.ACTIVE,
      };
      let userInstance;
      const transaction = await sequelize.transaction(ISOLATION);
      try {
        userInstance = await User.updateOne({
          filter, data, userId: input.editorId, transaction,
        });
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
      const user = User.getObjectFromInstance(userInstance);
      result = { user: super.flatten(user), password };
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: user not found`);
    }
    return result;
  }
}

module.exports = new PasswordService();