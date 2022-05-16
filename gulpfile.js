// Node
import del from "del"
import through from "through2"
import vinylFTP from 'vinyl-ftp';
import fs from 'fs';
import path from 'path';

// Gulp
import gulp from "gulp"
import plumber from "gulp-plumber"
import sourcemaps from "gulp-sourcemaps"
import gulpif from "gulp-if"
import rename from "gulp-rename"
import notify from "gulp-notify"
import size from 'gulp-filesize'
import zipPlugin from "gulp-zip";
import gulpUtil from 'gulp-util';

// HTML
import htmlmin from 'gulp-htmlmin'
import htmlhint from 'gulp-htmlhint'
import fileinclude from 'gulp-file-include'
import gulpEjsMonster from 'gulp-ejs-monster'
import versionNumber from "gulp-version-number";
import imgToPicture from "gulp-html-img-to-picture"

// SASS
import dartSass from 'sass'
import gulpSass from 'gulp-sass'

// PostCSS
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import sortMediaQueries from 'postcss-sort-media-queries'

// Images
import newer from "gulp-newer"

import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin'
import imageminJpegoptim from 'imagemin-jpegoptim'
import tinypng from 'gulp-tinypng-compress'

import webp from 'gulp-webp'
import avif from 'gulp-avif'

// JS & Webpack
import webpack from "webpack"
import webpackStream from "webpack-stream"

// Enviroment
import {setDevelopmentEnvironment, setProductionEnvironment, isProduction, isDevelopment} from 'gulp-node-env'

setDevelopmentEnvironment()


// BrowserSync
import bs from "browser-sync"

const browserSync = bs.create()

const srcFolder = './src'
const buildFolder = './dist'

const paths = {
    html: {
        src: [
            `${srcFolder}/*.html`,
            `${srcFolder}/**/*.php`,
            `${srcFolder}/**/*.ejs`
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
            `${srcFolder}/assets/css/vendors/*.scss`,
        ],
        dest: `${buildFolder}/assets/css/`
    },
    js: {
        src: [
            `${srcFolder}/assets/js/scripts.js`,
            `${srcFolder}/assets/js/components/*.js`,
            `${srcFolder}/assets/js/functions/*.js`,
        ],
        dest: `${buildFolder}/assets/js/`
    },
    img: {
        src: `${srcFolder}/assets/img/**/**/*`,
        srcForWebpConversion: `${srcFolder}/assets/img/**/**/*.{jpg,png,jpeg}`,
        srcForAvifConversion: `${srcFolder}/assets/img/**/**/*.{jpg,png,jpeg}`,
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

const serve = () => {
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

const reload = () => {
    browserSync.reload()
}

const clean = () => {
    return del(buildFolder)
}

const scss = () => {
    const sass = gulpSass(dartSass)

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
            autoprefixer(),
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

        .pipe(rename("styles.min.css"))
        .pipe(gulpif(isDevelopment, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(size())
        .pipe(browserSync.stream())
}

const js = () => {
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
        .pipe(gulpif(isDevelopment,
            webpackStream({
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
                    new webpack.optimize.LimitChunkCountPlugin({
                        maxChunks: 1
                    })
                ],
                experiments: {
                    topLevelAwait: true,
                },
                output: {
                    filename: '[name].js',
                    sourceMapFilename: "[name].js.map"
                },
            })
        )).on('error', function handleError() {
            this.emit('end'); // Recover from errors
        })

        // Webpack Production
        .pipe(gulpif(isProduction(),
            webpackStream({
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
                    new webpack.optimize.LimitChunkCountPlugin({
                        maxChunks: 1
                    })
                ],
                experiments: {
                    topLevelAwait: true,
                },
                output: {
                    filename: '[name].js',
                    sourceMapFilename: "[name].js.map"
                },
            })
        )).on('error', function handleError() {
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

const html = () => {
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

        // Compile EJS
        // .pipe(gulpEjsMonster({compileDebug: true}).on('error', gulpEjsMonster.preventCrash))

        // Convert IMG to <picture>
        .pipe(imgToPicture(
            {
                imgFolder: `${buildFolder}/`
            }
        ))

        // Add version to scripts & styles
        .pipe(gulpif(isProduction(),
            versionNumber({
                'value': '%DT%',
                'append': {
                    'key': '_v',
                    'cover': 0,
                    'to': [
                        'css',
                        'js',
                    ]
                },
                /*
                'output': {
                   'file': 'gulp/version.json'
                }
               */
            })
        ))

        // Validate HTML
        .pipe(gulpif(isDevelopment(), htmlhint({
            // Tags
            "tag-pair": true,
            "tags-check": false,
            "tag-self-close": false,
            "tagname-lowercas": true,
            "tagname-specialchars": true,
            // ID
            'id-unique': true,
            // Attributes
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

const generateZip = () => {
    del(`./app.zip`);
    return gulp.src(`${buildFolder}/**/*.*`, {})
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "Zip Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(zipPlugin(`app.zip`))
        .pipe(gulp.dest('./'))
}

const ftp = () => {
    const ftpConnect = vinylFTP.create({
        host: "",
        user: "",
        password: "",
        port: '21',
        parallel: 16,
        maxConnections: 16,
        log: gulpUtil.log
    })

    return gulp.src(`${buildFolder}/**/*.*`)
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "FTP Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(ftpConnect.dest(
            './app'
        ))
}

const files = (end) => {
    // Fonts
    gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))

    // Vendors
    gulp.src(paths.vendors.src)
        .pipe(gulp.dest(paths.vendors.dest))

    // Videos
    gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest))

        .pipe(browserSync.stream())

    end()
}

const img = (end) => {
    gulp.src(paths.img.src)
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
        .pipe(imagemin([
            // GIF
            gifsicle({interlaced: true}),

            // PNG
            optipng({optimizationLevel: 5}),

            // SVG
            svgo({}),

            // JPG
            mozjpeg({quality: 75, progressive: true}),
            imageminJpegoptim({
                progressive: true,
                stripAll: true,
                stripXmp: true,
                stripIptc: true,
                stripCom: true,
                stripIcc: true,
                stripExif: true,
            })
        ], {
            optimizationLevel: 4,
            progressive: true,
        }))

        /*
        .pipe(tinypng({
            key: '', // https://tinify.cn/dashboard/api
            log: true
        }))
        */

        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))

    // WebP
    gulp.src(paths.img.srcForWebpConversion)
        .pipe(gulpif(isDevelopment(), newer(paths.img.dest)))  // Loop only new images
        .pipe(webp())
        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))

    // Avid
    gulp.src(paths.img.srcForAvifConversion)
        .pipe(gulpif(isDevelopment(), newer(paths.img.dest)))  // Loop only new imagesgulp
        .pipe(avif())
        .pipe(gulp.dest(paths.img.src_dest))
        .pipe(gulp.dest(paths.img.dest))

    end()
}


const watch = () => {
    // SCSS
    gulp.watch(paths.scss.src, gulp.series(scss))

    // JS
    gulp.watch(paths.js.src, gulp.series(js))

    // HTML
    gulp.watch(paths.html.watch_srs, gulp.series(html))

    // Images
    gulp.watch(paths.img.src, gulp.series(img))

    // Vendors folder
    gulp.watch(paths.vendors.src, gulp.series(reload))

    // Video
    gulp.watch(paths.video.src, gulp.series(reload))

    // Fonts
    gulp.watch(paths.fonts.src, gulp.series(reload))
}

export {serve, reload, watch, clean, scss, js, html, img, files, generateZip, ftp}

const dev = gulp.series(setDevelopmentEnvironment, clean, gulp.parallel(files, scss, js, img), html, gulp.parallel(watch, serve))
const build = gulp.series(setProductionEnvironment, clean, gulp.parallel(files, scss, js, img), html)
const zip = gulp.series(build, generateZip)
const deploy = gulp.series(build, ftp)

export {dev, build, zip, deploy}
export {dev as default}