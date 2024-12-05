// Node
const through = require("through2");
const fs = require('fs');
const path = require('path');

// Gulp
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps")
const gulpif = require("gulp-if")
const rename = require("gulp-rename")
const notify = require("gulp-notify")
const size = require('gulp-filesize')
const gulpUtil = require('gulp-util')
const clean = require('gulp-clean');

// HTML
const htmlmin = require('gulp-htmlmin')
const htmlhint = require('gulp-htmlhint')
const fileinclude = require('gulp-file-include')
const versionNumber = require("gulp-version-number")
const imgToPicture = require("gulp-html-img-to-picture")

// Sass
const sass = require('gulp-sass')(require('sass'));

// PostCSS
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sortMediaQueries = require('postcss-sort-media-queries');

// Images
const newer = require("gulp-newer");
const webp = require('gulp-webp');
const avif = require('gulp-avif');

// JS & Webpack
const webpack = require("webpack") // "babel-loader"
const webpackStream = require("webpack-stream")

// BrowserSync
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top

// Enviroment
const {
          setDevelopmentEnvironment,
          setProductionEnvironment,
          isProduction,
          isDevelopment
      } = require('gulp-node-env')

// Set Development enironment by default
setDevelopmentEnvironment();

const srcFolder = './src'
const buildFolder = './dist'

const paths = {
    html: {
         src: [
            `${srcFolder}/*.html`,
            `${srcFolder}/template-parts/**/*.html`,
            `${srcFolder}/**/*.php`,
        ],
        watch_srs: [
            `${srcFolder}/**/*.html`,
            `${srcFolder}/**/*.php`,
            `${srcFolder}/**/*.ejs`
        ],
        dest: `${buildFolder}/`
    },
    scss: {
        src: [
            `${srcFolder}/assets/css/*.scss`,
            `${srcFolder}/assets/css/components/*.scss`,
            `${srcFolder}/assets/css/other/*.scss`,
            `${srcFolder}/assets/css/pages/*.scss`,
            `${srcFolder}/assets/css/sections/*.scss`,
            `${srcFolder}/assets/css/blocks/*.scss`,
            `${srcFolder}/assets/css/vendors/*.scss`,
        ],
        dest: `${buildFolder}/assets/css/`
    },
    js: {
        src: [
            `${srcFolder}/assets/js/scripts.js`,
            `${srcFolder}/assets/js/components/*.js`,
            `${srcFolder}/assets/js/pages/*.js`,
            `${srcFolder}/assets/js/forms/*.js`,
            `${srcFolder}/assets/js/functions/*.js`,
        ],
        dest: `${buildFolder}/assets/js/`
    },
    img: {
        src:`${srcFolder}/assets/img/*`,
        srcForOptimization: `${srcFolder}/assets/img/**/**/*.{jpg,png,jpeg}`,
        srcForConversion: `${srcFolder}/assets/img/**/**/*.{jpg,png,jpeg}`,
        src_dest: `${srcFolder}/assets/img/`,
        dest: `${buildFolder}/assets/img/`,
    },
    video: {
        src: `${srcFolder}/assets/video/**/**/*`,
        dest: `${buildFolder}/assets/video/`
    },
    vendors: {
        src: `${srcFolder}/assets/vendors/**/**/*`,
        dest: `${buildFolder}/assets/vendors/`
    },
    fonts: {
        src: [
            `${srcFolder}/assets/fonts/**/**/*`
        ],
        dest: [
            `${buildFolder}/assets/fonts/`
        ]
    }
}

function serve() {
    const proxyServer = false
    const domain = 'localhost/test'
    if (proxyServer) {
        browserSync.init({
            proxy: domain,
            notify: false,
            port: 4001
        })
    } else {
        browserSync.init({
            server: {
                baseDir: buildFolder
            },
            notify: false,
            port: 4001
        })
    }
}

function reload() {
    browserSync.reload()
}

function cleanDist() {
    return gulp.src(paths.img.srcForConversion)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "Clear Dist Folder Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))

    return gulp.src(buildFolder)
        .pipe(clean({force: true}))
}

function scss() {
    return gulp.src(paths.scss.src)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(gulpif(isDevelopment, sourcemaps.init()))

        // SCSS
        .pipe(sass().on('error', sass.logError))

        // Dev PostCSS
        .pipe(gulpif(isDevelopment, postcss([
            autoprefixer(),
        ])))

        // Build PostCSS
        .pipe(gulpif(isProduction, postcss([
            autoprefixer({
                grid: false
            }),
            cssnano({
                autoprefixer: true,
                cssDeclarationSorter: true,
                calc: true,
                colormin: true,
                convertValues: true,
                discardComments: {removeAll: true},
                discardDuplicates: true,
                discardEmpty: true,
                discardOverridden: true,
                discardUnused: true,
                mergeIdents: true,
                mergeLonghand: true,
                mergeRules: true,
                minifyFontValues: true,
                minifyGradients: true,
                minifyParams: true,
                minifySelectors: true,
                normalizeCharset: true,
                normalizeDisplayValues: true,
                normalizePositions: true,
                normalizeRepeatStyle: true,
                normalizeString: true,
                normalizeTimingFunctions: true,
                normalizeUnicode: true,
                normalizeUrl: true,
                normalizeWhitespace: true,
                orderedValues: true,
                reduceIdents: true,
                reduceInitial: true,
                reduceTransforms: true,
                svgo: true,
                uniqueSelectors: true,
                zindex: false,
            }),
            sortMediaQueries({
                sort: 'desktop-first' // default
            })
        ])))
        .pipe(gulpif(isDevelopment, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(size())
        .pipe(browserSync.stream())
}

function js() {
    return gulp.src(paths.js.src)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))

        // Webpack Development
        .pipe(gulpif(isDevelopment, webpackStream({
            devtool: "eval-source-map",
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        use: ['babel-loader']
                    },
                ],
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                }),
                new webpack.AutomaticPrefetchPlugin(),
            ],
            experiments: {
                topLevelAwait: true,
            },
            output: {
                filename: '[name].js',
                sourceMapFilename: "[name].js.map"
            },
        }))).on('error', function handleError() {
            this.emit('end'); // Recover from errors
        })

        // Webpack Production
        .pipe(gulpif(isProduction(), webpackStream({
            devtool: false,
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        use: ['babel-loader']
                    },
                ],
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                }),
                new webpack.AutomaticPrefetchPlugin(),
            ],
            experiments: {
                topLevelAwait: true,
            },
            output: {
                filename: '[name].js',
                sourceMapFilename: "[name].js.map"
            },
        }))).on('error', function handleError() {
            this.emit('end'); // Recover from errors
        })

        .pipe(gulpif(isDevelopment, sourcemaps.init()))
        .pipe(through.obj(function (file, enc, cb) {
            const isSourceMap = /\.map$/.test(file.path);
            if (!isSourceMap) this.push(file);
            cb();
        }))
        .pipe(gulpif(isDevelopment, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(size())
        .pipe(browserSync.stream())
}

function html() {
    return gulp.src(paths.html.src)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "HTML Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))

        // Combine HTML Parts
        .pipe(fileinclude())

        // Convert IMG to <picture>
        .pipe(imgToPicture({
            imgFolder: `${buildFolder}/`
        }))

        // Add version to scripts & styles
        .pipe(gulpif(isProduction(), versionNumber({
            'value': '%DT%',
            'append': {
                'key': '_v',
                'cover': 0,
                'to': [
                    'css',
                    'js',
                ]
            }, /*
                'output': {
                   'file': 'gulp/version.json'
                }
               */
        })))

        // Validate HTML
        .pipe(gulpif(isDevelopment(), htmlhint({
            // Tags
            "tag-pair": true,
            "tags-check": false,
            "tag-self-close": false,
            "tagname-lowercas": true,
            "tagname-specialchars": true, // ID
            'id-unique': true, // Attributes
            'alt-require': true
        })))
        .pipe(gulpif(isDevelopment(), htmlhint.failOnError()))

        // Compress HTML
        .pipe(gulpif(isProduction(), htmlmin({
            useShortDoctype: true,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeComments: true
        })))

        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
}

function files(callback) {
    // Fonts
    gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))

    // Vendors
    gulp.src(paths.vendors.src)
        .pipe(gulp.dest(paths.vendors.dest))

    // Videos
    gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest))

    // Image
    gulp.src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest))

        .pipe(browserSync.stream())

    callback()
}

function imgOptimization() {
    return gulp.src(paths.img.srcForOptimization)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "IMG Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))

        // Images Compression
        .pipe(newer(paths.img.dest))  // Loop only new images

        /*
        .pipe(tinypng({
            key: '', // https://tinify.cn/dashboard/api
            log: true
        }))
        */

        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))
}

function imgWebPConversion() {
    // WebP
    return gulp.src(paths.img.srcForConversion)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "WebP Conversion Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(gulpif(isDevelopment(), newer(paths.img.srcForConversion)))
        .pipe(webp({
                quality: 70,
                alphaQuality: 85,
                metadata: 'none',
            }
        ))
        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))
}

function imgAvifConversion() {
    // Avif
    return gulp.src(paths.img.srcForConversion)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "Avif Conversion Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(gulpif(isDevelopment(), newer(paths.img.srcForConversion)))

        .pipe(avif({
            quality: 70,
            speed: 8,
        }))

        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))
}

function watch() {
    // SCSS
    gulp.watch(paths.scss.src, gulp.series(scss))

    // JS
    gulp.watch(paths.js.src, gulp.series(js))

    // HTML
    gulp.watch(paths.html.watch_srs, gulp.series(html))

    // Images
    gulp.watch(paths.img.srcForOptimization, gulp.series(imgOptimization, imgWebPConversion, imgAvifConversion))

    // Vendors folder
    gulp.watch(paths.vendors.src, gulp.series(reload))

    // Video
    gulp.watch(paths.video.src, gulp.series(reload))

    // Fonts
    gulp.watch(paths.fonts.src, gulp.series(reload))
}

const img = gulp.series(imgOptimization, imgWebPConversion, imgAvifConversion);
const dev = gulp.series(setDevelopmentEnvironment, cleanDist, gulp.parallel(files, scss, js, img), html, gulp.parallel(watch, serve))
const build = gulp.series(setProductionEnvironment, cleanDist, gulp.parallel(files, scss, js, img), html)

exports.build = build

exports.dev = dev
exports.default = dev
