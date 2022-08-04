const _ = require('lodash');
const Sequelize = require('sequelize');
const { Utility, CommonBaseEntity } = require('rpro-utility');
const { USER_ROLE, USER_STATUS } = Utility.Enumerations;

const UserRoles = Object.values(USER_ROLE);
const UserStatuses = Object.values(USER_STATUS);

const model = (DataTypes) => _.merge(CommonBaseEntity(DataTypes), {
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    field: 'employee_id',
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  picture: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: UserRoles,
    default: USER_ROLE.USER,
  },
  loggedInCount: {
    field: 'logged_in_count',
    type: DataTypes.INTEGER,
    default: 0,
  },
  loggedInTimestamp: {
    field: 'logged_in_timestamp',
    type: DataTypes.DATE,
    allowNull: false,
  },
  latestResetTimestamp: {
    field: 'latest_reset_timestamp',
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: UserStatuses,
    default: USER_STATUS.INACTIVE,
  },
  tOtpToken: {
    field: 't_otp_token',
    type: DataTypes.UUID,
  },
  queryNotificationTimestamp: {
    field: 'query_notification_timestamp',
    type: DataTypes.DATE,
  },
  playerIds: {
    field: 'player_ids',
    type: DataTypes.ARRAY(DataTypes.STRING),
    default: [],
  },
});

module.exports = (sequelize, DataTypes) => {
  class Users extends Sequelize.Model {}
  Users.init(model(DataTypes), {
    sequelize,
    timestamps: false,
    underscoredAll: true,
    freezeTableName: true,
    modelName: 'users',
  });
  return Users;
};
