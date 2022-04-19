# TSOA webpack plugin
This webpack plugin extends webpack builds with [tsoa](https://www.npmjs.com/package/tsoa) functionality.  This can be more convenient in scenarios where the configuration needs to be determined or needs to be dynamic.

## Hooks
Adding the plugin has the following effects.
### beforeRun, watchRun
Before the build is run (including in watch mode and `webpack-dev-server`), the `routes.ts` is generated based on the options provided to the plugin.

### afterEmit
After the build output is emitted, a `swagger.json` file is generated based on the options provided to the plugin.


## Example usage
```ts
import TsoaWebpackPlugin from "tsoa-webpack-plugin";
import path from "path";

/**
 * @type import("webpack").Configuration 
 */
{
    // ...
    plugins: [
        new TsoaWebpackPlugin({
            entryFile: "./src/index.ts",
            noImplicitAdditionalProperties: "throw-on-extras",
            controllerPathGlobs: [
                "src/controllers/**/*Controller.ts",
            ],
            routes: {
                basePath: "/",
                routesDir: "src",
                middleware: "express",
                authenticationModule: "./src/authentication.ts",
            },
            spec: {
                host: `localhost:${process.env.PORT}`,
                basePath: "/",
                outputDirectory: path.join(__dirname, "dist"),
                specVersion: 3,
                securityDefinitions: {
                    access_token: {
                        type: "oauth2",
                        flow: "application",
                        tokenUrl: "https://local.identity/token",
                        description: "Get and provide an access_token",
                    },
                    api_key: {
                        type: "apiKey",
                        description: "Provide an API key in the query string",
                        in: "query",
                        name: "api_key",
                    },
                    basic: {
                        type: "basic",
                        description: "Provide username and password in the authorization header",
                    },
                },
            },
        })
    ],
}
```