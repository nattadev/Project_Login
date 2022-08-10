const { makeExecutableSchema, gql } = require('apollo-server-express');

const schema = makeExecutableSchema({
  typeDefs: gql`
    type Query {
      User(query: UserQueryInput): UserOutput
      UserLogin(query: UserLoginInput!): UserOutput
      UserList(query: UserListInput): [UserListOutput]!
      UserLoginRedeem(query: UserLoginRedeemInput!): UserOutput
      UserSuggest(query: UserFullNameInput): [UserOutput]!
      UserGetSecret(query: UserQueryInput!): UserSecretOutput!
      UserVerifyTOtp(query: UserTOtpInput!): Boolean
      UserValidateDuplicateProfile(query: UserCheckInput!): Boolean
    }
    type Mutation {
      UserRegister(value: UserRegisterInput!): UserOutput
      UserResetPassword(value: UserResetPasswordInput!): Boolean
      UserChangePassword(value: UserChangePasswordInput!): Boolean
      UserUpdateProfile(value: UserUpdateProfileInput!): UserOutput
      UserSaveProfilePicture(value: UserUploadPictureInput!): String
      UserDelete(value: UserDeleteInput!): Boolean
      UserSubscribeNotification(value: UserSubscribeInput!): Boolean
      UserUnsubscribeNotification(value: UserSubscribeInput!): Boolean
      UserAddStation(value: UserStationInput!): UserOutput
      UserSetStations(value: UserStationsInput!): UserOutput
    }
    input UserLoginRedeemInput {
      token: String!
    }
    input UserListInput {
      station_id: String
      status: [String!]
    }
    input UserFullNameInput {
      full_name: String!
    }
    input UserStationInput {
      user_id: String!
      station: StationGroupInput!
    }
    input UserCheckInput {
      username: String
      email: String
      employee_id: String
    }
    input UserStationsInput {
      user_id: String!
      stations: [StationGroupInput!]!
    }
    input StationGroupInput {
      id: String!
      group: String!
    }
    input UserSubscribeInput {
      player_id: String!
    }
    input UserUploadPictureInput {
      image: String!
    }
    input UserUpdateProfileInput {
      user_id: String!
      firstname: String!
      lastname: String!
      email: String!
      phone: String
      employee_id: String
    }
    input UserDeleteInput {
      user_id: String!
    }
    input UserLoginInput {
      username: String!
      password: String!
    }
    input UserQueryInput {
      user_id: String!
    }
    input UserRegisterInput {
      firstname: String!
      lastname: String!
      username: String!
      email: String!
      phone: String
      employee_id: String
      is_admin: Boolean
    }
    input UserResetPasswordInput {
      user_id: String!
    }
    input UserChangePasswordInput {
      old_pwd: String!
      new_pwd: String!
    }
    type UserSecretOutput {
      secret: String!
    }
    input UserTOtpInput {
      t_otp: String!
    }
    type UserOutput {
      id: String!
      firstname: String!
      lastname: String!
      username: String!
      email: String!
      phone: String
      employee_id: String
      token: String
      refresh_token: String
      role: String
      picture: String
      status: String!
      stations: [UserStationOutput]
    }
    type UserListOutput {
      id: String!
      firstname: String!
      lastname: String!
      username: String!
      email: String!
      phone: String
      employee_id: String
      token: String
      refresh_token: String
      role: String
      picture: String
      status: String!
      stations: [UserStationOutput]
    }
    type UserStationOutput {
      id: String!
      name: String!
      type: String
      sub_types: [String]
      station_catalog: UserStationCatalogOutput
      group: String
    }
    type UserStationCatalogOutput {
      id: String!
      name: String
      type: String!
      sub_types: [String]
      device_rules: [UserStationCatalogDeviceRulesOutput]
      pictures: [String]
      icon: String
      plc_template_id: String  
    }
    type UserStationCatalogDeviceRulesOutput {
      type: String
      sub_type: String
      availability: String
      position: [String]
    }
  `,
});

module.exports = schema;
