const { Compilation, sources } = require('webpack');
const output = "twinkle-lite.js";

// Adapted from https://stackoverflow.com/a/65529189
class NoWiki {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('NoWiki', (compilation) => {
            compilation.hooks.processAssets.tap(
                { name: 'NoWiki', stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE, },
                () => compilation.updateAsset(output,
                    (src) => new sources.RawSource("//<nowiki>\n" + src.source() + "\n//</nowiki>\n"),
                ),
            );
        });
    }
}

module.exports = {
    output: { filename: output },
    optimization: { minimize: false },
    mode: 'production',
    plugins: [new NoWiki()],
};