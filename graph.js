const fs = require('fs');
const path = require('path');
const { sequelize, File, Directory, Class, Interface, Type, Enum, Function, Variable, Import, Export, Component } = require('./models');

async function generateMermaidGraph(file) {
  try {
    if (!file) {
      console.log('No File records found in the database.');
      return;
    }

    // Generate Mermaid graph
    let graph = '';

    graph += await generateFileDiagram(file)

    console.log("Writing graph:", graph);
    // Write Mermaid graph to a file
    const outputFile = path.join(__dirname, 'mermaid', `${file.id}.mmd`);
    fs.writeFileSync(outputFile, graph);

    console.log(`Mermaid graph generated for File ID ${file.id} at ${outputFile}`);
  } catch (error) {
    console.error('Error generating Mermaid graph:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}
function logFileInfo(file) {
  console.log('File Information:');
  console.log('  ID:', file.id);
  console.log('  Path:', file.path);
  console.log('  Directory:', file.Directory.path);
  console.log('  Classes:');
  file.Classes.forEach((classRecord) => {
    console.log('    -', classRecord.name);
    console.log('      Interfaces:');
    classRecord.Interfaces.forEach((interfaceRecord) => {
      console.log('        -', interfaceRecord.name);
    });
  });
  console.log('  Interfaces:');
  file.Interfaces.forEach((interfaceRecord) => {
    console.log('    -', interfaceRecord.name);
  });
  console.log('  Types:');
  file.Types.forEach((typeRecord) => {
    console.log('    -', typeRecord.name);
  });
  console.log('  Enums:');
  file.Enums.forEach((enumRecord) => {
    console.log('    -', enumRecord.name);
  });
  console.log('  Functions:');
  file.Functions.forEach((functionRecord) => {
    console.log('    -', functionRecord.name);
    console.log('            Parameters:');
    functionRecord.parameters.forEach((parameterRecord) => {
      console.log('              -', parameterRecord.name);
      console.log('                Type:', parameterRecord.Type?.name || 'unknown');
    });
    console.log('            Return Type:', functionRecord.returnType?.name || 'void');
    console.log('            Calls:');
    functionRecord?.calls?.forEach((calledFunction) => {
      console.log('              -', calledFunction.name);
    });
    console.log('            Modifies:');
    functionRecord?.modifies?.forEach((modifiedVariable) => {
      console.log('                -', modifiedVariable.name);
    });
  });
  console.log('  Variables:');
  file.Variables.forEach((variableRecord) => {
    console.log('    -', variableRecord.name);
    console.log('      Type:', variableRecord.Type?.name || 'unknown');
    console.log('      Modified By Functions:');
    variableRecord.modifiedByFunctions.forEach((functionRecord) => {
      console.log('        -', functionRecord.name);
    });
  });
  console.log('  Imports:');
  file.Imports.forEach((importRecord) => {
    console.log('    - Path:', importRecord.path);
    console.log('      Names:', importRecord.names);
    console.log('      Default Import:', importRecord.defaultImport);
  });
  console.log('  Exports:');
  file.Exports.forEach((exportRecord) => {
    console.log('    -', exportRecord.name);
  });
  console.log('  Components:');
  file.Components.forEach((componentRecord) => {
    console.log('    -', componentRecord.name);
    console.log('      Props:', componentRecord.props);
    console.log('      Generic Types:', componentRecord.genericTypes);
  });
}

async function getFile() {
  // Synchronize models with the database
  await sequelize.sync();
  // Retrieve the first File record with associated models
  const file = await File.findOne({
    include: [
      {
        model: Directory,
        as: 'Directory',
      },
      {
        model: Class,
        as: 'Classes',
        include: [
          {
            model: Interface,
            as: 'Interfaces',
          },
        ],
      },
      {
        model: Interface,
        as: 'Interfaces',
      },
      {
        model: Type,
        as: 'Types',
      },
      {
        model: Enum,
        as: 'Enums',
      },
      {
        model: Function,
        as: 'Functions',
        include: [
          {
            model: Variable,
            as: 'parameters',
            include: [
              {
                model: Type,
                as: 'Type',
              },
            ],
          },
          {
            model: Type,
            as: 'returnType',
          },
          {
            model: Function,
            as: 'calls',
          },
          {
            model: Variable,
            as: 'modifies',
          },
        ],
      },
      {
        model: Variable,
        as: 'Variables',
        include: [
          {
            model: Type,
            as: 'Type',
          },
          {
            model: Function,
            as: 'modifiedByFunctions',
          },
        ],
      },
      {
        model: Import,
        as: 'Imports',
      },
      {
        model: Export,
        as: 'Exports',
      },
      {
        model: Component,
        as: 'Components',
      },
    ],
  });

  // console.info("Found file ", file)
  logFileInfo(file)
  return file;
}

async function generateFileDiagram(file) {

  let diagram = ``;

  // Create the main export class
  diagram += `class ${file.path} {\n`;

  // Add exports as methods
  for (const exportItem of file.Exports) {
    diagram += `  +${exportItem.name}()\n`;
  }

  // Close the main export class
  diagram += '}\n';

  // Create import classes
  for (const importItem of file.Imports) {
    diagram += `class ${importItem.path} {\n`;
    const relatedFile = await File.findOne({ where: { path: importItem.path } });
    if (relatedFile) {
      // const exports = await File.findAll({ where: { FileId: relatedFile.id } });
      for (const exportItem of exports) {
        diagram += `  ${generateFileDiagram(relatedFile)}\n`;
      }
    }
    diagram += '}\n';

    // for (namedImport of importItem.names) {
    //   // Add the dependency relationship
    //   diagram += `${file.path} ..> ${importItem.path}${namedImport} : imports\n`;
    // }
  }

  return diagram;
}


async function generateClassDiagram(classId) {
  const cls = await Class.findByPk(classId, {
    include: [{ model: Interface }],
  });

  if (!cls) {
    throw new Error(`Class with ID ${classId} not found.`);
  }

  const diagram = `
    graph TD
      Class[Class: ${cls.name}]
      ${cls.Interfaces.map((iface) => `
        Interface_${iface.id}[Interface: ${iface.name}]
        Class -.-> Interface_${iface.id}[implements]
      `).join('')}
  `;

  return diagram;
}

async function generateFunctionDiagram(functionId) {
  const func = await Function.findByPk(functionId, {
    include: [
      { model: Type, as: 'returnType' },
      { model: Variable, as: 'parameters' },
      { model: Function, as: 'calls' },
      { model: Variable, as: 'modifies' },
    ],
  });

  if (!func) {
    throw new Error(`Function with ID ${functionId} not found.`);
  }

  const diagram = `
    graph TD
      Function[Function: ${func.name}]
      ${func.returnType ? `ReturnType[Type: ${func.returnType.name}]` : ''}
      ${func.parameters.map((param) => `
        Parameter_${param.id}[Variable: ${param.name}]
        Function --> Parameter_${param.id}
      `).join('')}
      ${func.calls.map((calledFunc) => `
        CalledFunction_${calledFunc.id}[Function: ${calledFunc.name}]
        Function --> CalledFunction_${calledFunc.id}[calls]
      `).join('')}
      ${func.modifies.map((modifiedVar) => `
        ModifiedVariable_${modifiedVar.id}[Variable: ${modifiedVar.name}]
        Function --> ModifiedVariable_${modifiedVar.id}[modifies]
      `).join('')}
  `;

  return diagram;
}

async function generateVariableDiagram(variableId) {
  const variable = await Variable.findByPk(variableId, {
    include: [
      { model: Type },
      { model: Function, as: 'modifiedByFunctions' },
    ],
  });

  if (!variable) {
    throw new Error(`Variable with ID ${variableId} not found.`);
  }

  const diagram = `
    graph TD
      Variable[Variable: ${variable.name}]
      ${variable.Type ? `Type[Type: ${variable.Type.name}]` : ''}
      ${variable.modifiedByFunctions.map((func) => `
        Function_${func.id}[Function: ${func.name}]
        Function_${func.id} --> Variable[modifies]
      `).join('')}
  `;

  return diagram;
}

// Usage example
// const filePath = '/home/acidhax/dev/originals/dataset-manager-nextjs/src/auth.ts';
getFile().then(generateMermaidGraph)