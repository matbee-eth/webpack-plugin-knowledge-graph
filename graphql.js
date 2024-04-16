const { GraphQLInt, GraphQLInputObjectType, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLSchema, printSchema, lexicographicSortSchema } = require('graphql');
const { resolver } = require('graphql-sequelize');
const { File, Directory, Class, Interface, Type, Enum, Function, Variable, Import, Export, Component } = require('./models');
const fs = require('fs')
const FileType = new GraphQLObjectType({
  name: 'File',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    path: { type: new GraphQLNonNull(GraphQLString) },
    Directory: {
      type: DirectoryType,
      resolve: resolver(Directory),
    },
    Classes: {
      type: new GraphQLList(ClassType),
      resolve: resolver(Class),
    },
    Interfaces: {
      type: new GraphQLList(InterfaceType),
      resolve: resolver(Interface),
    },
    Types: {
      type: new GraphQLList(TypeType),
      resolve: resolver(Type),
    },
    Enums: {
      type: new GraphQLList(EnumType),
      resolve: resolver(Enum),
    },
    Functions: {
      type: new GraphQLList(FunctionType),
      resolve: resolver(Function),
    },
    Variables: {
      type: new GraphQLList(VariableType),
      resolve: resolver(Variable),
    },
    Imports: {
      type: new GraphQLList(ImportType),
      resolve: resolver(Import),
    },
    Exports: {
      type: new GraphQLList(ExportType),
      resolve: resolver(Export),
    },
    Components: {
      type: new GraphQLList(ComponentType),
      resolve: resolver(Component),
    },
  }),
});

const DirectoryType = new GraphQLObjectType({
  name: 'Directory',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    path: { type: new GraphQLNonNull(GraphQLString) },
    Files: {
      type: new GraphQLList(FileType),
      resolve: resolver(File),
    },
  }),
});

const ClassType = new GraphQLObjectType({
  name: 'Class',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
    Interfaces: {
      type: new GraphQLList(InterfaceType),
      resolve: resolver(Interface),
    },
  }),
});

const InterfaceType = new GraphQLObjectType({
  name: 'Interface',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
    Classes: {
      type: new GraphQLList(ClassType),
      resolve: resolver(Class),
    },
  }),
});

const TypeType = new GraphQLObjectType({
  name: 'Type',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
  }),
});

const EnumType = new GraphQLObjectType({
  name: 'Enum',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
  }),
});

const FunctionType = new GraphQLObjectType({
  name: 'Function',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
    returnType: {
      type: TypeType,
      resolve: resolver(Type),
    },
    parameters: {
      type: new GraphQLList(VariableType),
      resolve: resolver(Variable),
    },
    calls: {
      type: new GraphQLList(FunctionType),
      resolve: resolver(Function),
    },
    modifies: {
      type: new GraphQLList(VariableType),
      resolve: resolver(Variable),
    },
  }),
});

const VariableType = new GraphQLObjectType({
  name: 'Variable',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
    Type: {
      type: TypeType,
      resolve: resolver(Type),
    },
    usedInFunctions: {
      type: new GraphQLList(FunctionType),
      resolve: resolver(Function),
    },
    modifiedByFunctions: {
      type: new GraphQLList(FunctionType),
      resolve: resolver(Function),
    },
  }),
});

const ImportType = new GraphQLObjectType({
  name: 'Import',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    path: { type: new GraphQLNonNull(GraphQLString) },
    names: { type: new GraphQLNonNull(GraphQLString) },
    defaultImport: { type: GraphQLString },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
  }),
});

const ExportType = new GraphQLObjectType({
  name: 'Export',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
  }),
});

const ComponentType = new GraphQLObjectType({
  name: 'Component',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    props: { type: new GraphQLNonNull(GraphQLString) },
    genericTypes: { type: GraphQLString },
    File: {
      type: FileType,
      resolve: resolver(File),
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    files: {
      type: new GraphQLList(FileType),
      args: {
        where: { type: FileWhereInput },
        limit: { type: GraphQLInt },
      },
      resolve: resolver(File, {
        where: (args) => {
          const where = {};
          if (args.where.path) {
            where.path = { [Op.like]: args.where.path };
          }
          return where;
        },
        limit: (args) => args.limit,
      }),
    },
    directories: {
      type: new GraphQLList(DirectoryType),
      resolve: resolver(Directory),
    },
    classes: {
      type: new GraphQLList(ClassType),
      resolve: resolver(Class),
    },
    interfaces: {
      type: new GraphQLList(InterfaceType),
      resolve: resolver(Interface),
    },
    types: {
      type: new GraphQLList(TypeType),
      resolve: resolver(Type),
    },
    enums: {
      type: new GraphQLList(EnumType),
      resolve: resolver(Enum),
    },
    functions: {
      type: new GraphQLList(FunctionType),
      resolve: resolver(Function),
    },
    variables: {
      type: new GraphQLList(VariableType),
      resolve: resolver(Variable),
    },
    imports: {
      type: new GraphQLList(ImportType),
      resolve: resolver(Import),
    },
    exports: {
      type: new GraphQLList(ExportType),
      resolve: resolver(Export),
    },
    components: {
      type: new GraphQLList(ComponentType),
      resolve: resolver(Component),
    },
  }),
});

const FileWhereInput = new GraphQLInputObjectType({
  name: 'FileWhereInput',
  fields: () => ({
    path: { type: GraphQLString },
  }),
});

const schema = new GraphQLSchema({
  query: QueryType,
});

// Export the schema as a string
const schemaString = printSchema(lexicographicSortSchema(schema));

// Write the schema to a file
fs.writeFileSync('schema.graphql', schemaString);

// Export the resolvers
const exportResolvers = (schema) => {
  const typeMap = schema.getTypeMap();
  const resolvers = {};

  for (const [typeName, type] of Object.entries(typeMap)) {
    if (type instanceof GraphQLObjectType) {
      const fields = type.getFields();
      resolvers[typeName] = {};

      for (const [fieldName, field] of Object.entries(fields)) {
        if (field.resolve) {
          resolvers[typeName][fieldName] = field.resolve.toString();
        }
      }
    }
  }

  return resolvers;
};

const exportedResolvers = exportResolvers(schema);

// Write the resolvers to a file
fs.writeFileSync('resolvers.json', JSON.stringify(exportedResolvers, null, 2));
// module.exports = schema;
module.exports = {
  schema,
  resolvers: exportedResolvers,
};

