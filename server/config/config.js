require('dotenv').config();

module.exports = {
  development: {
    username: process.env.RPRO_BACKEND_POSTGRES_USERNAME  || 'kawa_user',
    password: process.env.RPRO_BACKEND_POSTGRES_PASSWORD || 'Wa@TErkaW@a29',
    database: process.env.RPRO_BACKEND_POSTGRES_DATABASE || 'water',
    host: process.env.RPRO_BACKEND_POSTGRES_HOST || 'localhost',
    port: process.env.RPRO_BACKEND_POSTGRES_PORT || '5432',
    dialect: 'postgres',
    define: {
      underscored: true,
    },
  },
  test: {
    username: process.env.RPRO_BACKEND_POSTGRES_USERNAME,
    password: process.env.RPRO_BACKEND_POSTGRES_PASSWORD,
    database: process.env.RPRO_BACKEND_POSTGRES_DATABASE,
    host: process.env.RPRO_BACKEND_POSTGRES_HOST,
    port: process.env.RPRO_BACKEND_POSTGRES_PORT,
    dialect: 'postgres',
    define: {
      underscored: true,
    },
  },
  production: {
    username: process.env.RPRO_BACKEND_POSTGRES_USERNAME,
    password: process.env.RPRO_BACKEND_POSTGRES_PASSWORD,
    database: process.env.RPRO_BACKEND_POSTGRES_DATABASE,
    host: process.env.RPRO_BACKEND_POSTGRES_HOST,
    port: process.env.RPRO_BACKEND_POSTGRES_PORT,
    dialect: 'postgres',
    define: {
      underscored: true,
    },
  }
};
