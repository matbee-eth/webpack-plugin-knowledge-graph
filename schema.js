const { GraphQLSchema, GraphQLObjectType } = require('graphql');
const { resolver } = require('graphql-sequelize');
const { File, Directory, Class, Interface, Type, Enum, Function, Variable } = require('./models');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      files: {
        type: resolver(File),
        resolve: resolver(File),
      },
      directories: {
        type: resolver(Directory),
        resolve: resolver(Directory),
      },
      classes: {
        type: resolver(Class),
        resolve: resolver(Class),
      },
      interfaces: {
        type: resolver(Interface),
        resolve: resolver(Interface),
      },
      types: {
        type: resolver(Type),
        resolve: resolver(Type),
      },
      enums: {
        type: resolver(Enum),
        resolve: resolver(Enum),
      },
      functions: {
        type: resolver(Function),
        resolve: resolver(Function),
      },
      variables: {
        type: resolver(Variable),
        resolve: resolver(Variable),
      },
    },
  }),
});

module.exports = schema;