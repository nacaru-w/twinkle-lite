const { Compilation, sources, ConcatenationScope, experiments } = require('webpack');
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
    entry: './src/index.ts',
    target: ['es6', 'web'],
    output: {
        filename: output,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: [['@babel/preset-env', { targets: 'defaults', loose: true }]],
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    optimization: {
        minimize: false,
    },
    mode: 'production',
    plugins: [
        new NoWiki(),
    ],
};