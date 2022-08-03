const { Sequelize } = require('sequelize');



module.exports = new Sequelize('water', 'kawa_user', 'Wa@TErkaW@a29', {
    host: 'localhost',
    port: 5432 ,
    dialect: 'postgres' 

  })