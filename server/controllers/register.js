const Joi = require('@hapi/joi');
const uuid = require('uuid');
const { Utility, Saga } = require('rpro-utility');
const RegisterService = require('../services/register');
const UserService = require('../services/info');

const { SagaDefinitionBuilder, SagaMessage } = Saga;
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { ERROR_NAME } = Utility.Enumerations;

const scrubFields = ['hash', 'loggedInCount', 'loggedInTimestamp', 'tOtpToken'];
const emailRegex = new RegExp(
  /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/
);

const schema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().lowercase().regex(emailRegex).required(),
  phone: Joi.string().empty(['', null]),
  employee_id: Joi.string().empty(['', null]),
  is_admin: Joi.boolean().empty(['', null]).default(false),
}).required();

module.exports = async (input) =>
  new Promise(async (resolve, reject) => {
    try {
      const validData = validate(input.value, schema);
      const sagaDefinitionBuilder = new SagaDefinitionBuilder()
        .step('CreateUser')
        .onReply(async (payload) => {
          const { user, password } = await RegisterService.register(
            payload
          ).catch((err) => reject(err));

          if (!user) {
            return reject(
              `${ERROR_NAME.INVALID_REQUEST}: 'user cannot be registered'`
            );
          }
          return { user, password };
        })
        .withCompensation(async () => {
          // transaction rolled back
          await UserService.forceDelete(validData.username);
        })
        .step('SetUserDefaultPage')
        .onReply(async (payload) => {
          const groupId = 'PAGE_GROUP';
          const event = 'PAGE_SET_USER_DEFAULT';
          const transaction = uuid.v4();
          const clsSagaMessage = new SagaMessage(groupId, transaction, event);
          const { role, id } = payload.user;
          const message = { userId: id, userType: role };
          await clsSagaMessage.sendingMessages('PAGE_SERVICE', message);
          return payload;
        })
        .withCompensation(async () => {
          // transaction rolled back
        })
        .step('SendMail')
        .onReply(async (payload) => {
          const groupId = 'MAIL_GROUP';
          const event = 'USER_REGISTRATION_MAIL';
          const transaction = uuid.v4();
          const clsSagaMessage = new SagaMessage(groupId, transaction, event);
          await clsSagaMessage.sendingMessages('MAIL_SERVICE', payload);
          const user = Helper.scrub(payload.user, scrubFields);
          const result = Helper.handleSuccess(user, 'user');
          return resolve(result);
        })
        .withCompensation(async () => {});

      const sagaProcessor = await sagaDefinitionBuilder.build();
      await sagaProcessor.start(validData);
    } catch (error) {
      reject(new Error(error.message));
    }
  });
