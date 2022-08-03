const { mergeSchemas } = require('graphql-tools');
const schema = require('./schema');
const resolvers = require('./resolver');
const schemas = [schema];
module.exports = ({ schemas, resolvers });
