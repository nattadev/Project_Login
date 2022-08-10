const Joi = require('@hapi/joi');
const uuid = require('uuid');
const PasswordService = require('../services/password');
const { Utility, Saga } = require('rpro-utility');
const Helper = Utility.Helper;
const validate = Utility.Validate;
const { SagaDefinitionBuilder, SagaMessage } = Saga;

const schema = Joi.object({
  user_id: Joi.string().length(36).required(),
  editor_id: Joi.string().length(36).empty(['', null]),
}).required();

module.exports = async (input) => new Promise(async (resolve, reject) => {
  try {
    const validData = validate(input.value, schema)
    const sagaDefinitionBuilder = new SagaDefinitionBuilder()
      .step('ResetPassword')
        .onReply(async (payload) => {
          console.log('Step 1 : Reset password');
          const { user, password } = await PasswordService.changePassword(payload).catch((err) => reject(err));
          if (!user) {
            return reject(new Error(`${ERROR_NAME.INVALID_REQUEST}: 'password cannot be reseted'`));
          } 
          return { user, password };
        })
        .withCompensation(async () => {
          // transaction rolled back
          resolve(false);
        })
      .step('SendMail')
        .onReply(async (payload) => {
          console.log('Step 2 : SendMail');
          const topic = 'MAIL_SERVICE';
          const groupId = 'MAIL_GROUP';
          const transaction = uuid.v4();
          const clsSagaMessage = new SagaMessage(groupId, transaction, 'USER_CHANGE_PASSWORD_MAIL');
          await clsSagaMessage.sendingMessages(topic, payload);
          const response = await clsSagaMessage.waitForKafkaMessages('MAIL_SERVICE_REPLY')
                          .catch(() => {
                            reject(new Error(`Email could not be sent: internal server error`))
                          })
          if(response.result !== true) {
            reject(new Error(`Email could not be sent: internal server error`));
          }
          const result = Helper.handleSuccess(true, 'user');
          resolve(result);
        })
        .withCompensation(async () => {});

    const sagaProcessor = await sagaDefinitionBuilder.build();
    await sagaProcessor.start(validData); 
  } catch (error) {
    reject(new Error(error.message));
  }
});