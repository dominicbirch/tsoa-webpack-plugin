import BundleDeclarationsWebpackPlugin from "bundle-declarations-webpack-plugin";
import path from "path";

const
  { name: packageName } = require("./package.json"),
  srcPath = path.resolve(__dirname, "src"),
  outPath = path.resolve(__dirname, ".dist");

  
export default {
  target: "node",
  mode: "production",
  entry: {
    index: "./src/index.ts",
  },
  output: {
    clean: true,
    path: outPath,
    libraryExport: "default",
    library: {
      type: "umd",
      name: packageName,
      umdNamedDefine: true,
    },
    environment: {
      dynamicImport: true,
      module: true,
      destructuring: true,
      arrowFunction: true,
      optionalChaining: true,
    },
  },
  resolve: {
    modules: [srcPath, "node_modules"],
    extensions: [".js", ".ts", ".ejs", ".cjs", ".json"],
  },
  externalsPresets: { node: true },
  externals: ["glob", "tsoa"],
  plugins: [
    new BundleDeclarationsWebpackPlugin({
      entry: {
        filePath: "./src/index.ts",
      },
      outFile: "index.d.ts",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(?:[jt]|[ce]j)s$/i,
        include: srcPath,
        exclude: [
          path.join(__dirname, "node_modules"),
          path.join(__dirname, "__mocks__"),
          path.join(__dirname, "__tests__"),
          /\.tests?\.[tj]s$/i,
        ],
        use: [
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
    ],
  },
};
