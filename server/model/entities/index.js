const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { Utility } = require('rpro-utility');
const sequelize = Utility.Sequelize.getInstance().getConnection();

const toPascalCase = (word) => _.startCase(_.camelCase(word)).replace(/ /g, '');
const db = {};
const files = fs.readdirSync(__dirname)
  .filter((file) => (file.indexOf('.') !== 0)
    && (file !== 'base.js')
    && (file !== 'index.js')
    && (file.slice(-3) === '.js'));
const entityFiles = files.filter((file) => !file.includes('_'));
const mappingFiles = files.filter((file) => file.includes('_'));

entityFiles.forEach((file) => {
  const model = sequelize.import(path.join(__dirname, file));
  db[toPascalCase(model.name)] = model;
});
mappingFiles.forEach((file) => {
  const model = sequelize.import(path.join(__dirname, file));
  db[toPascalCase(model.name)] = model;
});

Object.keys(db).forEach((model) => {
  if (db[model].associate) {
    db[model].associate(db);
  }
});

db.sequelize = sequelize;
module.exports = db;
