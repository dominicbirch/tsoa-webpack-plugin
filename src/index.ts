import { join, relative } from "path";
import { Config, generateRoutes, generateSpec } from "tsoa";
import type { CompilerOptions } from "typescript";
import type { Compiler, WebpackPluginInstance } from "webpack";

/**@augments Config
 * These are the `Config` options from TSOA, except that routes & spec are individually optional (and/or)
 */
export type Options = Config | Exclude<Config, "routes"> | Exclude<Config, "spec">;

export const NAME = "TsoaWebpackPlugin";


type WebpackLogger = {
    getChildLogger: (arg0: string | (() => string)) => WebpackLogger;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    assert(assertion: any, ...args: any[]): void;
    trace(): void;
    clear(): void;
    status(...args: any[]): void;
    group(...args: any[]): void;
    groupCollapsed(...args: any[]): void;
    groupEnd(...args: any[]): void;
    profile(label?: any): void;
    profileEnd(label?: any): void;
    time(label?: any): void;
    timeLog(label?: any): void;
    timeEnd(label?: any): void;
    timeAggregate(label?: any): void;
    timeAggregateEnd(label?: any): void;
};


async function routes({ entryFile, noImplicitAdditionalProperties, routes, compilerOptions, ignore }: Options, logger?: WebpackLogger) {
    logger?.log("Generating routes...");

    const { controllers, referenceTypeMap } = await generateRoutes({
        entryFile,
        noImplicitAdditionalProperties,
        ...routes,
    }, <CompilerOptions>compilerOptions, ignore);

    logger?.log("Routes generated ^.^/", controllers, referenceTypeMap);
}

async function spec({ entryFile, noImplicitAdditionalProperties, spec, compilerOptions, ignore }: Options, logger?: WebpackLogger) {
    logger?.log("Generating spec...");

    const { controllers, referenceTypeMap } = await generateSpec({
        entryFile,
        noImplicitAdditionalProperties,
        ...spec,
    }, <CompilerOptions>compilerOptions, ignore);

    logger?.log("Spec generated ^.^/", controllers, referenceTypeMap);
}

/**Integrates the following as a webpack plugin
 * * `tsoa spec`
 * * `tsoa routes`
 * * `tsoa spec-and-routes`
 */
export class TsoaWebpackPlugin implements WebpackPluginInstance {
    /**Creates a new instance of the plugin using the options provided */
    constructor(/**The TSOA options to be used */readonly _options: Options) { }

    /**@inheritdoc */
    apply(compiler: Compiler) {
        if (this._options.routes) {
            compiler.hooks.beforeRun.tapPromise(NAME, c =>
                routes(this._options, c.getInfrastructureLogger(NAME))
            );
            compiler.hooks.watchRun.tapPromise(NAME, async c => {
                if (!c.modifiedFiles || ![...c.modifiedFiles].every(m => m.includes(this._options.routes.routesFileName || "routes.ts"))) {
                    await routes(this._options, c.getInfrastructureLogger(NAME));
                }
            });
        }
        if (this._options.spec) {
            compiler.hooks.thisCompilation.tap(NAME, (c, _params) => {
                const { sources, Compilation } = compiler.webpack;

                c.hooks.processAssets.tapPromise({ name: NAME, stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE }, async (_assets) => {
                    await spec(this._options, c.getLogger(NAME));

                    const
                        { readFile } = await import("fs/promises"),
                        absolutePath = join(this._options.spec.outputDirectory || c.outputOptions.path, `${this._options.spec.specFileBaseName || "swagger"}.${this._options.spec.yaml ? "yaml" : "json"}`),
                        { RawSource } = sources;

                    c.emitAsset(relative(c.outputOptions.path, absolutePath), new RawSource(await readFile(absolutePath)));
                });
            });
        }
    }
}

export default TsoaWebpackPlugin;