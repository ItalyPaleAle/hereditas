const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SriPlugin = require('webpack-subresource-integrity')
const {DefinePlugin} = require('webpack')
const {sass} = require('svelte-preprocess-sass')
const path = require('path')
const fs = require('fs')
const marked = require('marked')

const mode = process.env.NODE_ENV || 'production'
const prod = mode === 'production'

const htmlMinifyOptions = {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    collapseBooleanAttributes: true,
    decodeEntities: true,
    html5: true,
    keepClosingSlash: false,
    processConditionalComments: true,
    removeEmptyAttributes: true
}

// Welcome content
let welcomeContent = ''
if (fs.existsSync('welcome.md')) {
    const welcomeMarkdown = fs.readFileSync('welcome.md', 'utf8')
    welcomeContent = marked(welcomeMarkdown)
}

/**
 * Returns a configuration object for webpack
 *
 * @param {Object} appParams - Params for the application
 * @returns {Object} Configuration object for webpack
 */
function webpackConfig(appParams) {
    return {
        entry: {
            hereditas: [path.resolve(__dirname, 'main.js')],
        },
        resolve: {
            mainFields: ['svelte', 'browser', 'module', 'main'],
            extensions: ['.mjs', '.js', '.svelte'],
            modules: [path.resolve(__dirname, '../node_modules')]
        },
        resolveLoader: {
            modules: [path.resolve(__dirname, '../node_modules')]
        },
        output: {
            path: path.resolve(process.cwd(), appParams.distDir),
            filename: '[name].[hash].js',
            chunkFilename: '[name].[id].[hash].js',
            crossOriginLoading: 'anonymous'
        },
        module: {
            rules: [
                {
                    test: /\.(svelte)$/,
                    exclude: [],
                    use: {
                        loader: 'svelte-loader',
                        options: {
                            emitCss: true,

                            // Preprocess SASS/SCSS
                            preprocess: {
                                style: sass({}, {name: 'scss'})
                            }
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        // MiniCssExtractPlugin doesn't support HMR.
                        // For developing, use 'style-loader' instead
                        prod ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        // MiniCssExtractPlugin doesn't support HMR.
                        // For developing, use 'style-loader' instead
                        prod ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
        mode,
        plugins: [
            // Constants
            new DefinePlugin({
                'process.env.AUTH_ISSUER': JSON.stringify(appParams.authIssuer),
                'process.env.AUTH_CLIENT_ID': JSON.stringify(appParams.authClientId),
                'process.env.ID_TOKEN_NAMESPACE': JSON.stringify(appParams.idTokenNamespace),
                'process.env.KEY_SALT': JSON.stringify(appParams.keySalt.toString('base64')),
                'process.env.INDEX_TAG': JSON.stringify(appParams.indexTag.toString('base64')),
                'process.env.PBKDF2_ITERATIONS': JSON.stringify(appParams.pbkdf2Iterations),
                'process.env.KEY_DERIVATION_FUNCTION': JSON.stringify(appParams.kdf),
                'process.env.WELCOME_MD': JSON.stringify(welcomeContent)
            }),

            // Extract CSS
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css'
            }),

            // Generate the index.html file
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: path.resolve(__dirname, 'main.html'),
                chunks: ['hereditas'],
                minify: prod ? htmlMinifyOptions : false
            }),

            // Enable subresource integrity check
            new SriPlugin({
                hashFuncNames: ['sha384'],
                enabled: prod,
            })
        ],
        devtool: prod ? false : 'source-map',
        performance: {
            // 400 KB (up from default 250 KB)
            maxEntrypointSize: 400000
        }
    }
}

module.exports = webpackConfig
