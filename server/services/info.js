const _ = require('lodash');
const crypto = require('crypto');
const uuid = require('uuid');
const hexTo32 = require('hex-to-32');
const speakeasy = require('speakeasy');
const User = require('../model');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const axios = require('axios');
const BaseService = require('./base');
const { Utility, Services, Saga } = require('rpro-utility');
const { Enumerations, Regex, Convention, Logger } = Utility;
const { FileService } = Services;
const { escapeCharacters } = Regex;
const { SagaMessage } = Saga;
const { USER_STATUS, ERROR_NAME, USER_ROLE } = Enumerations;
const sequelize = Utility.Sequelize.getInstance().getConnection();
const config = require('../config').getInstance().get();
const logger = Logger.Logger('user service');

const ISOLATION = {
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
};
const ACTIVE_STATUS = [USER_STATUS.ACTIVE, USER_STATUS.LOCKED];
const EXISTING_STATUS = [
  USER_STATUS.ACTIVE,
  USER_STATUS.INACTIVE,
  USER_STATUS.LOCKED,
];
const LIMIT = 10;
const ISSUER = 'RPRO';

class InfoService extends BaseService {
  async findById(id) {
    console.log('hello2')
    let result;
    const filter = { id, status: ACTIVE_STATUS };
    const instance = await User.findOne({ filter });
    if (instance) {
      result = User.getObjectFromInstance(instance);
      result.stations = [];
      result = super.flatten(result);
    }
    return result;
  }

  async findByIdWithStationsObj(id) {
    console.log('hello3')
    const result = await this.findById(id);
    if (result) {
      const response = await axios
        .get(`${config.stationService.url}/user/${id}/stations`)
        .then((response) => response.data)
        .catch(function (error) {
          new Error(`${ERROR_NAME.COMMUNICATION_ERROR}: ${error.message}`);
        });
      result.stations = response ? response.data : [];
    }
    return result;
  }

  async updateProfile(input) {
    let result;
    const fields = ['firstname', 'lastname', 'email', 'phone', 'employeeId'];
    const data = _.omitBy(_.pick(input, fields), _.isNil);

    const editiorUserInstance = await User.findOne({
      filter: { id: input.editorId },
    });
    let editorRole;
    if (editiorUserInstance) editorRole = editiorUserInstance.get('role');
    if (
      !_.isEqual(editorRole, USER_ROLE.SUPER_ADMIN) &&
      !_.isEqual(input.userId, input.editorId)
    ) {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: only owner is permitted`);
    }
    let uniqueFilter;
    if (_.get(data, 'employeeId')) {
      uniqueFilter = {
        [Op.or]: [
          {
            email: { [Op.iLike]: await escapeCharacters(_.get(data, 'email')) },
          },
          { employeeId: { [Op.iLike]: _.get(input, 'employeeId') } },
        ],
        status: EXISTING_STATUS,
      };
    } else {
      uniqueFilter = {
        email: { [Op.iLike]: await escapeCharacters(_.get(data, 'email')) },
        status: EXISTING_STATUS,
      };
    }
    const uniqueInstances = await User.findAll({ filter: uniqueFilter });
    if (uniqueInstances) {
      uniqueInstances.forEach((instance) => {
        if (!_.isEqual(_.get(instance, 'id'), input.userId)) {
          if (
            _.get(input, 'email', '').toUpperCase() ===
            instance.get('email').toUpperCase()
          ) {
            throw new Error(
              `${ERROR_NAME.INVALID_REQUEST}: email was duplicated`
            );
          } else {
            throw new Error(
              `${ERROR_NAME.INVALID_REQUEST}: employee_id was duplicated`
            );
          }
        }
      });
    }
    let instance;
    const filter = { id: input.userId, status: EXISTING_STATUS };
    const transaction = await sequelize.transaction(ISOLATION);
    try {
      instance = await User.updateOne({
        filter,
        data,
        userId: input.editorId,
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    if (instance) {
      result = User.getObjectFromInstance(instance);
      result = super.flatten(result);
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: user not found`);
    }
    return result;
  }

  async saveProfilePicture(input) {
    let result;
    const prefixImageRegex = new RegExp(/^data:image\/(jpeg|jpg|png);base64,/);
    const image = _.get(input, 'image', '').replace(prefixImageRegex, '');
    const bucket = _.get(config, 'file.user.bucket', '');
    const options = _.get(config, 'file.user.size');

    const filter = { id: input.userId, status: ACTIVE_STATUS };
    const instance = await User.findOne({ filter });
    if (instance) {
      const filename = await FileService.saveImageFromBase64(
        bucket,
        image,
        options
      );
      const lastFilename = instance.get('picture');
      if (lastFilename) {
        try {
          await FileService.deleteImage(bucket, lastFilename);
        } catch (err) {
          /* do nothing */
        }
      }
      const data = { picture: filename };
      const transaction = await sequelize.transaction(ISOLATION);
      try {
        await User.updateOne({
          filter,
          data,
          userId: input.editorId,
          transaction,
        });
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
      result = Convention.getPictureUrl('user', filename);
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: user not found`);
    }
    return result;
  }

  async forceDelete(username) {
    const filter = { username };
    await User.delete({ filter });
  }

  async delete(input) {
    const userId = _.get(input, 'userId');
    const editorId = _.get(input, 'editorId');
    const userFilter = { id: userId };
    const activeUserFilter = {
      id: userId,
      status: [USER_STATUS.ACTIVE, USER_STATUS.LOCKED, USER_STATUS.INACTIVE],
    };

    const userInstance = User.findOne({ filter: activeUserFilter });
    if (userInstance) {
      const transaction = await sequelize.transaction(ISOLATION);
      try {
        await User.removeAllAssociations({
          filter: userFilter,
          transaction,
        });
        await User.updateOne({
          filter: userFilter,
          data: { status: USER_STATUS.DELETED },
          userId: editorId,
          transaction,
        });
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    }
    return true;
  }
  async addPlayerId(input) {
    const userId = _.get(input, 'userId');
    const playerId = _.get(input, 'playerId');
    const filter = { id: userId, status: ACTIVE_STATUS };

    const transaction = await sequelize.transaction(ISOLATION);
    try {
      const userInstance = await User.findOne({ filter, transaction });
      if (!userInstance) {
        throw new Error(`${ERROR_NAME.INVALID_REQUEST}: unauthorized`);
      }

      const playerIds = userInstance.get('playerIds') || [];
      if (!_.isArray(playerIds) || !playerIds.includes(playerId)) {
        playerIds.push(playerId);
        const data = { playerIds };
        await User.updateOne({ filter, data, transaction });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    return true;
  }

  async removePlayerId(input) {
    const userId = _.get(input, 'userId');
    const playerId = _.get(input, 'playerId');
    const filter = { id: userId, status: ACTIVE_STATUS };

    const transaction = await sequelize.transaction(ISOLATION);
    try {
      const userInstance = await User.findOne({ filter, transaction });
      if (!userInstance) {
        throw new Error(`${ERROR_NAME.INVALID_REQUEST}: unauthorized`);
      }

      const playerIds = userInstance.get('playerIds') || [];
      if (_.isArray(playerIds) && playerIds.includes(playerId)) {
        _.remove(playerIds, (id) => id === playerId);
        const data = { playerIds };
        await User.updateOne({ filter, data, transaction });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    return true;
  }
  async findAllByStatuses(statuses) {
    const filter = {};
    if (Array.isArray(statuses) && statuses.length > 0) {
      filter.status = statuses;
    } else {
      filter.status = EXISTING_STATUS;
    }
    const instances = await User.findAll({ filter });
    let results = User.getObjectFromInstance(instances);
    results = results.map((obj) => super.flatten(obj));
    return results;
  }

  async findAllByStationIdAndStatuses(stationId, statuses) {
    const filter = {};
    if (Array.isArray(statuses) && statuses.length > 0) {
      filter.status = statuses;
    } else {
      filter.status = EXISTING_STATUS;
    }
    const groupId = 'BACKEND_GROUP';
    const event = 'STATION_USER_BY_STATION_ID';
    const transaction = uuid.v4();
    const clsSagaMessage = new SagaMessage(groupId, transaction, event);
    await clsSagaMessage.sendingMessages('STATION_SERVICE', { stationId });
    const response = await clsSagaMessage
      .waitForKafkaMessages('STATION_SERVICE_REPLY')
      .catch(() => {
        new Error(`${ERROR_NAME.COMMUNICATION_ERROR}: internal server error`);
      });
    let users = [];
    if (response) {
      users = response.station ? response.station.users : [];
    }

    const instances = await User.findAll({ filter });
    let results = User.getObjectFromInstance(instances);
    const userIds = users.map((user) => user.id);
    const groups = _.keyBy(users, 'id');
    results = results.map((obj) => {
      if (userIds.includes(obj.id)) {
        const group = groups[obj.id] ? groups[obj.id].group : null;
        const station = _.extend({}, response.station, { group: group });
        return { stations: [station], ...super.flatten(obj) };
      }
    });
    return _.compact(results);
  }
  async suggest(fullName) {
    const filter = {
      where: Sequelize.where(
        Sequelize.fn(
          'concat',
          Sequelize.col('firstname'),
          ' ',
          Sequelize.col('lastname')
        ),
        { [Op.iLike]: `%${fullName}%` }
      ),
      status: EXISTING_STATUS,
    };

    const instances = await User.findAll({ filter, limit: LIMIT });
    let results = User.getObjectFromInstance(instances);
    results = results.map((obj) => super.flatten(obj));
    return results;
  }
  async getSecret(id) {
    let result;
    const editorId = _.get(id, 'editorId');
    const filter = { id, status: ACTIVE_STATUS };
    const instance = await User.findOne({ filter });
    if (instance) {
      let newInstance;
      const transaction = await sequelize.transaction(ISOLATION);
      try {
        newInstance = await User.updateOne({
          filter,
          data: { tOtpToken: uuid.v4() },
          userId: editorId,
          transaction,
        });
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
      const hex = await crypto
        .createHash('sha512')
        .update(_.get(newInstance, 'tOtpToken'))
        .digest('hex');
      const base32 = await hexTo32.encode(hex);
      result = {
        secret: `otpauth://totp/${_.get(
          newInstance,
          'email'
        )}?secret=${base32}&issuer=${ISSUER}`,
      };
    }
    return result;
  }
  async verifyTOtp(input) {
    let tOtpValidates;
    const filter = { id: _.get(input, 'userId'), status: ACTIVE_STATUS };
    const instance = await User.findOne({ filter });
    if (instance && !_.isNull(_.get(instance, 'tOtpToken'))) {
      const hex = await crypto
        .createHash('sha512')
        .update(_.get(instance, 'tOtpToken'))
        .digest('hex');
      const base32 = await hexTo32.encode(hex);
      tOtpValidates = await speakeasy.totp.verify({
        secret: base32,
        encoding: 'base32',
        token: _.get(input, 'tOtp'),
        window: 1,
      });
    } else {
      throw new Error(`${ERROR_NAME.INVALID_REQUEST}: unauthorized`);
    }
    return tOtpValidates;
  }

  async validateDuplicateProfile(input) {
    const filter = { status: EXISTING_STATUS };
    if (_.get(input, 'username')) {
      filter.username = { [Op.iLike]: _.get(input, 'username') };
    } else if (_.get(input, 'email')) {
      filter.email = {
        [Op.iLike]: await escapeCharacters(_.get(input, 'email')),
      };
    } else if (_.get(input, 'employeeId')) {
      filter.employeeId = { [Op.iLike]: _.get(input, 'employeeId') };
    }
    const instances = await User.findAll({ filter });
    return !_.isEmpty(instances);
  }

  async updateQueryNotificationTimestamp(userId) {
    const filter = { id: userId, status: EXISTING_STATUS };
    return await User.updateOne({
      filter: filter,
      data: { queryNotificationTimestamp: Date.now() },
      userId: userId,
    });
  }

  async findByIds(ids) {
    let results = [];
    const filter = { id: ids, status: EXISTING_STATUS };
    const instances = await User.findAll({ filter });
    if (instances) {
      results = User.getObjectFromInstance(instances);
    }
    return results;
  }
  async getByDynamicFilter(dynamicFilter) {
    const filter = _.merge({ status: EXISTING_STATUS }, dynamicFilter);
    const instances = await User.findAll({ filter });
    return User.getObjectFromInstance(instances);
  }
}

module.exports = new InfoService();
