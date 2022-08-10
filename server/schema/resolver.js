const _ = require('lodash');
const UserRegister = require('../controllers/register');
const UserLogin = require('../controllers/login');
const UserGet = require('../controllers/get');
const UserChangePassword = require('../controllers/change_password');
const UserResetPassword = require('../controllers/reset_password');
const UserSaveProfilePicture = require('../controllers/save_profile_picture');
const UserUpdateProfile = require('../controllers/update_profile');
const UserDelete = require('../controllers/delete');
const UserSubscribeNotification = require('../controllers/subscribe_notification');
const UserUnsubscribeNotification = require('../controllers/unsubscribe_notification');
const UserAddStation = require('../controllers/add_station');
const UserSetStation = require('../controllers/set_station');
const UserLoginRedeem = require('../controllers/login_redeem');
const UserList = require('../controllers/list');
const UserSuggest = require('../controllers/suggest');
const UserGetSecret = require('../controllers/get_secret');
const UserVerifyTOtp = require('../controllers/verify_t_otp');
const UserValidateDuplicateProfile = require('../controllers/validate_duplicate_profile');
const InfoService = require('../services/info');
const { CommonUtils } = require('rpro-utility');
const { AuthGuard } = CommonUtils;

const resolver = {
  Query: {
    User: (root, args, ctx, ...funcArgs) => {
      const data = { query: _.merge(args.query, funcArgs[0].authorize) };
      return UserGet(data);
    },
    UserLogin: (root, args, ctx, ...funcArgs) => {
      console.log('hello')
      const data = { query: _.merge(args.query, funcArgs[0].authorize) };
      return UserLogin(data);
    },
    UserLoginRedeem: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { query: _.merge(args.query, funcArgs[0].authorize) };
      return UserLoginRedeem(data);
    }),
    UserList: AuthGuard((root, args, ctx, ...funcArgs) => {
      const query = _.merge(args.query, funcArgs[0].authorize);
      const data = _.isEmpty(query) ? {} : { query };
      return UserList(data);
    }),
    UserSuggest: AuthGuard((root, args, ctx, ...funcArgs) => {
      const query = _.merge(args.query, funcArgs[0].authorize);
      const data = _.isEmpty(query) ? {} : { query };
      return UserSuggest(data);
    }),
    UserGetSecret: AuthGuard((root, args, ctx, ...funcArgs) => {
      const query = _.merge(args.query, funcArgs[0].authorize);
      const data = _.isEmpty(query) ? {} : { query };
      return UserGetSecret(data);
    }),
    UserVerifyTOtp: AuthGuard((root, args, ctx, ...funcArgs) => {
      const query = _.merge(args.query, funcArgs[0].authorize);
      const data = _.isEmpty(query) ? {} : { query };
      return UserVerifyTOtp(data);
    }),
    UserValidateDuplicateProfile: AuthGuard((root, args, ctx, ...funcArgs) => {
      const query = _.merge(args.query, funcArgs[0].authorize);
      const data = _.isEmpty(query) ? {} : { query };
      return UserValidateDuplicateProfile(data);
    }),
  },
  Mutation: {
    UserRegister: (root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserRegister(data);
    },
    UserResetPassword: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserResetPassword(data);
    }),
    UserChangePassword: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserChangePassword(data);
    }),
    UserSaveProfilePicture: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserSaveProfilePicture(data);
    }),
    UserUpdateProfile: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserUpdateProfile(data);
    }),
    UserDelete: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserDelete(data);
    }),
    UserSubscribeNotification: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserSubscribeNotification(data);
    }),
    UserUnsubscribeNotification: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserUnsubscribeNotification(data);
    }),
    UserAddStation: AuthGuard((root, args, ctx, ...funcArgs) => {
      let data = _.merge(funcArgs[0].authorize, args.value);
      data = {
        value: {
          user_id: _.get(data, 'user_id'),
          stations: [_.get(data, 'station')],
          editor_id: _.get(data, 'editor_id'),
        },
      };
      return UserAddStation(data, ctx);
    }),
    UserSetStations: AuthGuard((root, args, ctx, ...funcArgs) => {
      const data = { value: _.merge(args.value, funcArgs[0].authorize) };
      return UserSetStation(data, ctx);
    }),
  },
  UserOutput: {
    stations: async (root, args, context, info) => {
      const { stations } = await InfoService.findByIdWithStationsObj(root.id);
      return stations;
    },
  }
};

module.exports = resolver;
