import path from 'path';
import webpack from 'webpack';
import extend from 'extend';
import AssetsPlugin from 'assets-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

const
    DEBUG = !process.argv.includes('--release'),
    VERBOSE = process.argv.includes('--verbose'),
    AUTOPREFIXER_BROWSERS = [
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 35',
        'Firefox >= 31',
        'Explorer >= 9',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6.1'
    ],
    GLOBALS = {
        ['process.env.NODE_ENV']: DEBUG ? '"development"' : '"production"',
        __DEV__: DEBUG
    },
    isExternal = (context, request) => request.match(/^[@a-z][a-z\/\.\-0-9]*$/i)
        && !request.match(/^react-routing/)
        && !context.match(/[\\/]react-routing/),

    // Common configuration chunk
    config = {
        output: {
            publicPath: '/',
            sourcePrefix: '  '
        },

        cache: DEBUG,
        debug: DEBUG,

        stats: {
            colors: true,
            reasons: DEBUG,
            hash: VERBOSE,
            version: VERBOSE,
            timings: true,
            chunks: VERBOSE,
            chunkModules: VERBOSE,
            cached: VERBOSE,
            cachedAssets: VERBOSE
        },

        plugins: [
            new webpack.optimize.OccurenceOrderPlugin()
        ],

        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json']
        },

        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    include: [
                        path.resolve(__dirname, '../node_modules/react-routing/src'),
                        path.resolve(__dirname, '../src'),
                        path.resolve(__dirname, '../servers')
                    ],
                    loader: 'babel-loader'
                }, {
                    test: /\.scss$/,
                    loaders: [
                        'isomorphic-style-loader',
                        `css-loader?${DEBUG ? 'sourceMap&' : 'minimize&-autoprefixer&'}modules&localIdentName=`
                        + `${DEBUG ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]'}`,
                        'postcss-loader?parser=postcss-scss',
                        'sass'
                    ]
                }, {
                    test: /\.json$/,
                    loader: 'json-loader'
                }, {
                    test: /\.txt$/,
                    loader: 'raw-loader'
                }, {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
                    loader: 'url-loader?limit=10000'
                }, {
                    test: /\.jade$/,
                    loader: 'jade-loader'
                }
            ]
        },

        postcss: function plugins(bundler) {
            return [
                require('postcss-import')({
                    addDependencyTo: bundler,
                    plugins: [
                        require('stylelint')()
                    ]
                }),
                require('precss')(),
                require('postcss-mixins')(),
                require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS })
            ];
        },
        node: {
            fs: 'empty'
        }
    },

    // Configuration for the client-side bundle (client.js)
    clientConfig = extend(true, {}, config, {
        entry: ['babel-polyfill', './src/client.js'],
        output: {
            path: path.join(__dirname, '../build/public'),
            filename: DEBUG ? '[name].js?[hash]' : '[name].js'
        },

        // Choose a developer tool to enhance debugging
        // http://webpack.github.io/docs/configuration.html#devtool
        devtool: DEBUG ? 'inline-source-map' : false,
        plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({ ...GLOBALS, ['process.env.BROWSER']: true }),
            new AssetsPlugin({
                path: path.join(__dirname, '../build'),
                filename: 'assets.js',
                processOutput: x => `module.exports = ${JSON.stringify(x)};`
            }),
            ...(!DEBUG ? [
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        screw_ie8: true,
                        warnings: VERBOSE
                    },
                    output: {comments: false}
                }),
                new webpack.optimize.AggressiveMergingPlugin(), new CompressionPlugin({
                    asset: "[path].gz[query]",
                    algorithm: "gzip",
                    test: /\.js$|\.css$|\.html$/,
                    threshold: 10240,
                    minRatio: 0.8
                    })
            ] : [])
        ]
    }),

    // static server configuration (static-server.js)
    staticServerConfig = extend(true, {}, config, {
        entry: './servers/static/index.js',
        output: {
            path: './build',
            filename: 'static-server.js',
            libraryTarget: 'commonjs2'
        },
        target: 'node',
        externals: [
            /^\.\/assets$/,
            function filter(context, request, cb) {
                cb(null, Boolean(isExternal(context, request)));
            }
        ],
        node: {
            console: false,
            global: false,
            process: false,
            Buffer: false,
            __filename: false,
            __dirname: false
        },
        devtool: 'source-map',
        plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({ ...GLOBALS, ['process.env.BROWSER']: false }),
            new webpack.BannerPlugin('require("source-map-support").install();',
                { raw: true, entryOnly: false })
        ]
    }),

    // Api server configuration (api-server.js)
    apiServerConfig = extend(true, {}, config, {
        entry: './servers/api/index.js',
        output: {
            path: './build',
            filename: 'api-server.js',
            libraryTarget: 'commonjs2'
        },
        target: 'node',
        externals: [
            /^\.\/assets$/,
            function filter(context, request, cb) {
                cb(null, Boolean(isExternal(context, request)));
            }
        ],
        node: {
            console: false,
            global: false,
            process: false,
            Buffer: false,
            __filename: false,
            __dirname: false
        },
        devtool: 'source-map',
        plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({ ...GLOBALS, ['process.env.BROWSER']: false }),
            new webpack.BannerPlugin('require("source-map-support").install();',
                { raw: true, entryOnly: false })
        ]
    });

export default [
    clientConfig,
    staticServerConfig
];
