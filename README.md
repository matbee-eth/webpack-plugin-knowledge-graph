# webpack-plugin-knowledge-graph

A Webpack plugin that generates a knowledge graph from your TypeScript codebase, allowing you to gain insights and analyze the relationships between classes, interfaces, types, enums, functions, imports, exports, and components in your project.

## Installation

You can install the `webpack-plugin-knowledge-graph` package using npm:

```bash
npm install webpack-plugin-knowledge-graph --save-dev
```

## Usage

To use the `webpack-plugin-knowledge-graph` plugin in your Webpack configuration, add it to the `plugins` array:

```javascript
const DatasetExportPlugin = require('webpack-plugin-knowledge-graph');

module.exports = {
  // ...
  plugins: [
    new DatasetExportPlugin({
      // Plugin options
      fileExtensions: ['.ts', '.tsx'],
      outputPath: 'dataset.sqlite',
      debug: false,
    }),
  ],
};
```

By default, the plugin will analyze your TypeScript codebase with `.ts` and `.tsx` file extensions and generate a knowledge graph during the Webpack build process.

## Configuration

The `webpack-plugin-knowledge-graph` plugin accepts the following options:

- `fileExtensions` (optional): An array of file extensions to include in the analysis. Default: `['.ts', '.tsx']`.
- `outputPath` (optional): The output path for the generated knowledge graph file. Default: `'dataset.parquet'`.
- `debug` (optional): Enable debug logging. Default: `false`.

## Generated Knowledge Graph

The `webpack-plugin-knowledge-graph` plugin generates a knowledge graph in the Parquet file format. The generated file will be saved at the specified `outputPath`.

The knowledge graph contains the following information for each analyzed TypeScript file:

- Classes: Including class names, properties, methods, dependencies, and generic types.
- Interfaces: Including interface names, properties, methods, dependencies, and generic types.
- Types: Including type names and definitions.
- Enums: Including enum names and members.
- Functions: Including function names, return types, parameters, and generic types.
- Imports: Including import paths, names, and default imports.
- Exports: Including exported names.
- Components: Including component names, props, and generic types.

The generated knowledge graph can be further processed and analyzed using tools that support the Parquet file format.

## Dependencies

The `webpack-plugin-knowledge-graph` plugin has the following dependencies:

- `@dsnp/parquetjs`: A library for reading and writing Parquet files.
- `typescript-splitter`: A library for parsing TypeScript code and extracting relevant information.

Make sure to install these dependencies before using the plugin.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/your-username/webpack-plugin-knowledge-graph).

## License

This project is licensed under the [MIT License](LICENSE).