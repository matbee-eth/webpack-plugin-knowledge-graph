const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'knowledge_graph.sqlite',
  retry: {
    match: [/SQLITE_BUSY/],
    max: 0, // Maximum number of retries
  },
  transactionType: 'IMMEDIATE',
});

const File = sequelize.define('File', {
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const Directory = sequelize.define('Directory', {
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const Class = sequelize.define('Class', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Interface = sequelize.define('Interface', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Type = sequelize.define('Type', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Enum = sequelize.define('Enum', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Function = sequelize.define('Function', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Variable = sequelize.define('Variable', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const FunctionHasParameter = sequelize.define('FunctionHasParameter', {}, {
  uniqueKeys: {
    functionParameterScope: {
      fields: ['FunctionId', 'VariableId'],
    },
  },
});

// Import model
const Import = sequelize.define('Import', {
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  names: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  defaultImport: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Export model
const Export = sequelize.define('Export', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Component model
const Component = sequelize.define('Component', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  props: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  genericTypes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// const Property = sequelize.define('Property', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// const Method = sequelize.define('Method', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// const Dependency = sequelize.define('Dependency', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });


// Associations
File.belongsTo(Directory);
Directory.hasMany(File);

Class.belongsTo(File);
File.hasMany(Class);

Interface.belongsTo(File);
File.hasMany(Interface);

Type.belongsTo(File);
File.hasMany(Type);

Enum.belongsTo(File);
File.hasMany(Enum);

Function.belongsTo(File);
File.hasMany(Function);

Variable.belongsTo(File);
File.hasMany(Variable);

Class.belongsToMany(Interface, { through: 'ClassImplementsInterface' });
Interface.belongsToMany(Class, { through: 'ClassImplementsInterface' });

Function.belongsTo(Type, { as: 'returnType' });

Function.belongsToMany(Variable, { as: 'parameters', through: 'FunctionHasParameter' });
Variable.belongsToMany(Function, { as: 'usedInFunctions', through: 'FunctionHasParameter' });

Function.belongsToMany(Function, { as: 'calls', through: 'FunctionCallsFunction' });

Function.belongsToMany(Variable, { as: 'modifies', through: 'FunctionModifiesVariable' });
Variable.belongsToMany(Function, { as: 'modifiedByFunctions', through: 'FunctionModifiesVariable' });

Variable.belongsTo(Type);

File.hasMany(Import);
Import.belongsTo(File);

File.hasMany(Export);
Export.belongsTo(File);

File.hasMany(Component);
Component.belongsTo(File);

module.exports = {
  sequelize,
  File,
  Directory,
  Class,
  Interface,
  Type,
  Enum,
  Function,
  Variable,
  Import,
  Export,
  Component,
};