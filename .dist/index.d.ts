import { Config } from 'tsoa';
import { Compiler, WebpackPluginInstance } from 'webpack';
/**Integrates the following as a webpack plugin
 * * `tsoa spec`
 * * `tsoa routes`
 * * `tsoa spec-and-routes`
 */
export declare class TsoaWebpackPlugin implements WebpackPluginInstance {
	readonly _options: Options;
	/**Creates a new instance of the plugin using the options provided */
	constructor(/**The TSOA options to be used */ _options: Options);
	[index: string]: any;
	/**@inheritdoc */
	apply(compiler: Compiler): void;
}
export declare const NAME = "TsoaWebpackPlugin";
/**@augments Config
 * These are the `Config` options from TSOA, except that routes & spec are individually optional (and/or)
 */
export declare type Options = Config | Exclude<Config, "routes"> | Exclude<Config, "spec">;
export default TsoaWebpackPlugin;