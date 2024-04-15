const fs = require('fs');
const path = require('path');
const os = require('os');
const parquet = require('@dsnp/parquetjs');
const { sequelize, schema, Directory, File, Class, Property, Method, Dependency, GenericType, Interface, Type, Enum, EnumMember, Function, Import, Export, Component, Variable } = require('./models');
const { parseTypeScriptCode } = require('typescript-splitter');

class DatasetExportPlugin {
  constructor(options) {

    this.options = {
      fileExtensions: options.fileExtensions || ['.ts', '.tsx'],
      outputPath: options.outputPath || 'dataset.parquet',
      debug: options.debug || false,
    };

    this.schema = new parquet.ParquetSchema({
      filepath: { type: 'UTF8' },
      data: { type: 'UTF8' },
      tokens: { type: 'INT64' },
    });

    // this.writer = parquet.ParquetWriter.openFile(schema, this.options.outputPath);

  }

  apply(compiler) {
    const { fileExtensions, outputPath, debug } = this.options;

    compiler.hooks.thisCompilation.tap('DatasetExportPlugin', (compilation) => {
      compilation.hooks.finishModules.tapAsync('DatasetExportPlugin', async (modules) => {
        for (const moduleData of modules) {
          console.log('moduleData', moduleData?.resource);
          await sequelize.sync();
          await sequelize.transaction(async (transaction) => {
            if (moduleData && moduleData.resource && fileExtensions.includes(path.extname(moduleData.resource))) {
              const name = path.relative(compiler.context, moduleData.resource);
              const code = fs.readFileSync(moduleData.resource, 'utf-8');
              // await this.writer.appendRow({ filepath: name, data: code, tokens: 0 });
              const { classes, interfaces, types, enums, functions, imports, exports, components } = parseTypeScriptCode(code, moduleData.resource);
              // Insert the file record
              const [directory, createdDirectory] = await Directory.findOrCreate({ transaction, where: { path: path.dirname(name) } });
              // Check if the file record already exists
              let file = await File.findOne({ transaction, where: { path: name, DirectoryId: directory?.id ?? createdDirectory?.id } });
              if (file) {
                // Update the existing file record
                console.log('Updating file:', file.path);
                await file.update({ path: name, DirectoryId: directory?.id ?? createdDirectory?.id }, { transaction });
                console.log('File updated:', file.path);
              } else {
                // Create a new file record
                const [_file, createdFile] = await File.findOrCreate({
                  transaction, where: { path: name, DirectoryId: directory?.id ?? createdDirectory?.id },
                  ignoreDuplicates: true,
                })
                file = _file;
                console.log('File created:', file.path);
              }

              // Insert the class records and associate them with the file
              const classRecords = await Class.bulkCreate(
                classes.map((classObj) => ({
                  name: classObj.name,
                  FileId: file.id,
                })),
                { transaction, updateOnDuplicate: ['name', 'FileId'] }
              );

              // // Insert class properties, methods, dependencies, and generic types
              // for (const [index, classObj] of classes.entries()) {
              //   const classRecord = classRecords[index];
              //   // Update the class record if it already exists
              //   await Property.bulkCreate(
              //     classObj.properties.map((property) => ({
              //       name: property.name,
              //       ClassId: classRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'ClassId'] }
              //   );

              //   await Method.bulkCreate(
              //     classObj.methods.map((method) => ({
              //       name: method.name,
              //       ClassId: classRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'ClassId'] }
              //   );

              //   await Dependency.bulkCreate(
              //     classObj.dependencies.map((dependency) => ({
              //       name: dependency.name,
              //       ClassId: classRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'ClassId'] }
              //   );

              //   await GenericType.bulkCreate(
              //     classObj.genericTypes.map((genericType) => ({
              //       name: genericType.name,
              //       ClassId: classRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'ClassId'] }
              //   );
              // }
              // Insert the interface records and associate them with the file
              const interfaceRecords = await Interface.bulkCreate(
                interfaces.map((interfaceObj) => ({
                  name: interfaceObj.name,
                  FileId: file.id,
                })),
                { transaction, updateOnDuplicate: ['name', 'FileId'] }
              );
              // // Insert interface properties, methods, dependencies, and generic types
              // for (const [index, interfaceObj] of interfaces.entries()) {
              //   const interfaceRecord = interfaceRecords[index];

              //   await Property.bulkCreate(
              //     interfaceObj.properties.map((property) => ({
              //       name: property.name,
              //       InterfaceId: interfaceRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'InterfaceId'] }
              //   );

              //   await Method.bulkCreate(
              //     interfaceObj.methods.map((method) => ({
              //       name: method.name,
              //       InterfaceId: interfaceRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'InterfaceId'] }
              //   );

              //   await Dependency.bulkCreate(
              //     interfaceObj.dependencies.map((dependency) => ({
              //       name: dependency.name,
              //       InterfaceId: interfaceRecord.id,
              //     })),
              //     { transaction, updateOnDuplicate: ['name', 'InterfaceId'] }
              //   );

              //   if (interfaceObj.genericTypes) {
              //     await Type.findOrCreate({
              //       name: interfaceObj.genericTypes,
              //       InterfaceId: interfaceRecord.id,
              //     }, { transaction, updateOnDuplicate: ['name', 'InterfaceId'] });
              //   }
              // }
              console.info("inserting types", types)
              if (types.length > 0) {
                // Insert the type records and associate them with the file
                await Type.bulkCreate(
                  types.map((typeObj) => ({
                    name: typeObj.name,
                    definition: typeObj.definition,
                    FileId: file.id,
                  })),
                  { transaction, updateOnDuplicate: ['name', 'definition', 'FileId'] }
                );
              }
              console.info("inserting enums", enums)
              // Insert the enum records and associate them with the file
              const enumRecords = await Enum.bulkCreate(
                enums.map((enumObj) => ({
                  name: enumObj.name,
                  FileId: file.id,
                })),
                { transaction, updateOnDuplicate: ['name', 'FileId'] }
              );

              // Insert enum members
              for (const [index, enumObj] of enums.entries()) {
                const enumRecord = enumRecords[index];

                await EnumMember.bulkCreate(
                  enumObj.members.map((member) => ({
                    name: member.name,
                    EnumId: enumRecord.id,
                  })),
                  { transaction, updateOnDuplicate: ['name', 'EnumId'] }
                );
              }

              const typeNames = [...new Set(functions.map(func => func.returnType))];
              
              console.info("Inserting Types Type.bulkCreate", typeNames)
              const insertedTypes = await Type.bulkCreate(
                typeNames.map(name => ({ name })),
                { transaction, ignoreDuplicates: true }
              );

              // Insert the function records and associate them with the file
              console.info("Inserting Functions Function.bulkCreate", functions[0], file.id, insertedTypes)
              await Function.bulkCreate(
                functions.map((functionObj) => {
                  const returnType = insertedTypes.find(type => type.name === functionObj.returnType);
                  return {
                    name: functionObj.name,
                    returnType: functionObj.returnType,
                    FileId: file.id,
                    TypeId: returnType?.id,
                  };
                }),
                {
                  transaction,
                  updateOnDuplicate: ['name', 'returnType', 'FileId', 'TypeId'],
                }
              );
              

              console.info("Inserting generic types", functions[0]?.genericTypes)
              // Insert function generic types
              for (const functionObj of functions) {
                const functionRecord = await Function.findOne({
                  where: { name: functionObj.name, FileId: file.id },
                  transaction,
                });

                await Type.bulkCreate(
                  [functionObj.genericTypes].filter(Boolean).map((genericType) => ({
                    name: genericType.name,
                    FunctionId: functionRecord.id,
                  })),
                  { transaction, updateOnDuplicate: ['name', 'FunctionId'] }
                );
              }

              // Insert function parameters
              for (const functionObj of functions) {
                const functionRecord = await Function.findOne({
                  where: { name: functionObj.name, FileId: file.id },
                  transaction,
                });
                console.log("functionObj.parameters", functionObj.parameters)
                // TODO: Add Type if not exists
                const parameterRecords = await Variable.bulkCreate(
                  await Promise.all(functionObj.parameters.map(async (parameter) => {
                    let typeName = parameter.type;
                    if (Array.isArray(typeName)) {
                      // Convert the array to a JSON string
                      typeName = JSON.stringify(typeName);
                    }
                    let type = await Type.findOne({ where: { name: typeName } });
                    if (!type) {
                      type = await Type.create({ name: typeName }, { transaction });
                    }
                    return {
                      name: parameter.name,
                      TypeId: type.id,
                    };
                  })),
                  { transaction, updateOnDuplicate: ['name', 'TypeId'] }
                );
                              
                await functionRecord.setParameters(parameterRecords, { transaction });
              }

              // Insert the import records and associate them with the file
              await Import.bulkCreate(
                imports.map((importObj) => ({
                  path: importObj.path,
                  names: importObj.names,
                  defaultImport: importObj.defaultImport,
                  FileId: file.id,
                })),
                {
                  transaction,
                  updateOnDuplicate: ['path', 'names', 'defaultImport', 'FileId'],
                }
              );

              // Insert the export records and associate them with the file
              await Export.bulkCreate(
                exports.map((exportName) => ({
                  name: exportName,
                  FileId: file.id,
                })),
                { transaction, updateOnDuplicate: ['name', 'FileId'] }
              );

              // Insert the component records and associate them with the file
              await Component.bulkCreate(
                components.map((componentObj) => ({
                  name: componentObj.name,
                  props: componentObj.props,
                  genericTypes: componentObj.genericTypes,
                  FileId: file.id,
                })),
                {
                  transaction,
                  updateOnDuplicate: ['name', 'props', 'genericTypes', 'FileId'],
                }
              );
              if (debug) {
                console.log(`[DatasetExportPlugin] Exporting for dataset: ${name}`);
              }

            }
          });
        }
      });
    });

    // Move the temporary file to the final output path after the build is done
    compiler.hooks.afterEmit.tapAsync('DatasetExportPlugin', async () => {
      try {
        // this.writer.close();
        if (debug) {
          console.log(`[DatasetExportPlugin] Embeddings moved to: ${outputPath}`);
        }
      } catch (ex) {

      }
    });
  }
}

module.exports = DatasetExportPlugin;