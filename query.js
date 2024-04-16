const { graphql } = require('graphql');
const { schema } = require('./graphql');
const fs = require('fs');

const query = `
query {
  files(limit: 1) {
    id
    path
    Directory {
      id
      path
    }
    Classes {
      id
      name
      Interfaces {
        id
        name
      }
    }
    Interfaces {
      id
      name
      Classes {
        id
        name
      }
    }
    Types {
      id
      name
    }
    Enums {
      id
      name
    }
    Functions {
      id
      name
      returnType {
        id
        name
      }
      parameters {
        id
        name
        Type {
          id
          name
        }
      }
      calls {
        id
        name
      }
      modifies {
        id
        name
      }
    }
    Variables {
      id
      name
      Type {
        id
        name
      }
      usedInFunctions {
        id
        name
      }
      modifiedByFunctions {
        id
        name
      }
    }
    Imports {
      id
      path
      names
      defaultImport
    }
    Exports {
      id
      name
    }
    Components {
      id
      name
      props
      genericTypes
    }
  }
}
`;
console.info("schema", schema)
graphql({ schema, source: query })
  .then((result) => {
    if (result.errors) {
      console.error('Error executing query:', result.errors);
      return;
    }

    const data = JSON.stringify(result.data, null, 2);
    fs.writeFileSync('src-app-index-ts-data.json', data);
    console.log('Data exported successfully!');
  })
  .catch((error) => {
    console.error(error);
  });