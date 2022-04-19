import type { Compiler, WebpackPluginInstance } from "webpack"
import type { CompilerOptions } from "typescript"
import { generateRoutes, generateSpec, Config } from "tsoa"


/**@augments Config
 * These are the `Config` options from TSOA, except that routes & spec are individually optional (and/or)
 */
export type Options = Config | Exclude<Config, "routes"> | Exclude<Config, "spec">;

export const NAME = "TsoaWebpackPlugin";


function routes({ entryFile, noImplicitAdditionalProperties, routes, compilerOptions, ignore }: Options) {
    return generateRoutes({
        entryFile,
        noImplicitAdditionalProperties,
        ...routes,
    }, <CompilerOptions>compilerOptions, ignore);
}

function spec({ entryFile, noImplicitAdditionalProperties, spec, compilerOptions, ignore }: Options) {
    return generateSpec({
        entryFile,
        noImplicitAdditionalProperties,
        ...spec,
    }, <CompilerOptions>compilerOptions, ignore);
}

/**Integrates the following as a webpack plugin
 * * `tsoa spec`
 * * `tsoa routes`
 * * `tsoa spec-and-routes`
 */
export class TsoaWebpackPlugin implements WebpackPluginInstance {
    /**Creates a new instance of the plugin using the options provided */
    constructor(/**The TSOA options to be used */readonly _options: Options) { }

    [index: string]: any;

    /**@inheritdoc */
    apply(compiler: Compiler) {
        if (this._options.routes) {
            compiler.hooks.beforeRun.tapPromise(NAME, async c => {
                this["meta"] = await routes(this._options);
            });
            compiler.hooks.watchRun.tapPromise(NAME, async c => {
                if (!c.modifiedFiles || (!this._options.controllerPathGlobs && ![...c.modifiedFiles].every(m => m.endsWith("routes.ts")))) {
                    this["meta"] = await routes(this._options);
                    return;
                }

                const { GlobSync } = await import("glob");
                if (this._options.controllerPathGlobs?.some(g => new GlobSync(g).found.some(f => c.modifiedFiles.has(f)))) {
                    this["meta"] = await routes(this._options);
                }
            });
        }
        if (this._options.spec) {
            compiler.hooks.afterEmit.tapPromise(NAME, async c => {
                this["meta"] = await spec(this._options);
            });
        }
    }
}

export default TsoaWebpackPlugin;