module.exports = {
    devtool: 'eval-source-map',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                query: {
                    presets: ["@babel/env"],
                    plugins: ["babel-plugin-root-import", 'dynamic-import-node-babel-7', '@babel/transform-runtime'],
                },
            },
        ],
    },
    output: {
        filename: "scripts.min.js",
        sourceMapFilename: "scripts.js.map"
    },
}
