const gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    gcmq = require('gulp-group-css-media-queries'),
    babel = require('gulp-babel'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    image = require('gulp-image'),
    clean = require('gulp-clean'),
    htmlmin = require('gulp-htmlmin');

const ProxyServer = false;
const domain = 'localhost/gulp/app';
const root = 'app';


const paths = {
    scss: {
        src: 'app/assets/css/**/*.scss',
        dest: 'app/assets/css'
    },
    js: {
        src: 'app/assets/js/main.js',
        dest: 'app/assets/js/'
    },
    img: {
        src: 'app/assets/img/**/**/*',
        dest: 'app/assets/img/'
    },
    html: {
        src: 'app/**/*.html',
        dest: 'app/'
    }
};

const buildPaths = {
    css: {
        src: ['app/assets/css/main.css'],
        build: 'build/assets/css/'
    },
    js: {
        src: 'app/assets/js/main.min.js',
        build: 'build/assets/js/'
    },
    html: {
        src: 'app/**/*.html',
        build: 'build/'
    },
    php: {
        src: 'app/**/*.php',
        build: 'build/'
    },
    img: {
        src: 'app/assets/img/**/**/*',
        build: 'build/assets/img/'
    },
    video: {
        src: 'app/assets/video/**/**/*',
        build: 'build/assets/video/'
    },
    audio: {
        src: 'app/assets/audio/**/**/*',
        build: 'build/assets/audio/'
    },
    vendors: {
        src: 'app/assets/vendors/**/**/**/**/**/*',
        build: 'build/assets/vendors/'
    },
    fonts: {
        src: 'app/assets/fonts/**/*',
        build: 'build/assets/fonts/'
    },
    favicon: {
        src: 'app/assets/favicon/**/*',
        build: 'build/assets/favicon/'
    },
    icons: {
        src: 'app/assets/icons/**/*',
        build: 'build/assets/icons/'
    }
}

function serve() {
    if (ProxyServer) {
        browserSync.init({
            proxy: domain,
            notify: false
        });
    } else {
        browserSync.init({
            server: {
                baseDir: root
            },
            notify: false
        });
    }
}

function reload(done) {
    browserSync.reload();
    done();
}

function watch() {
    gulp.watch(paths.scss.src, gulp.series(scss));
    gulp.watch(paths.js.src, gulp.series(js, reload));
    gulp.watch("app/**/*.html", reload);
    gulp.watch("app/**/*.php", reload);
    gulp.watch("app/assets/js/**/**/*.js", gulp.series(reload));
    gulp.watch("app/assets/vendors/**/**/*", gulp.series(reload));
    gulp.watch(paths.img.src, gulp.series(reload));
}

function js(done) {
    return gulp.src(paths.js.src)

        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(rename("main.min.js"))
       // .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
    done();
}

function scss(done) {
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notify.onError({
            message: "<%= error.message %>",
            title: "Sass Error!"
        })))
        .pipe(autoprefixer())
       // .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
    done();
}

function img(done) {
    return gulp.src(paths.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(image({
            svgo: false
        }))
        .pipe(gulp.dest(paths.img.dest));
    done();
}




/* Build Tasks */
function clean_build(done) {
    // Clean Build Folder
    return gulp.src('build/*').pipe(clean({  /* force: true  */}));
    done();
}

function build_css(done) {
    return gulp.src(buildPaths.css.src)
        .pipe(gulp.dest(buildPaths.css.build));
    done();
}

function build_js(done) {
    return gulp.src(buildPaths.js.src)
        .pipe(gulp.dest(buildPaths.js.build));
    done();
}

function build_html(done) {
    return gulp.src(buildPaths.html.src)
        .pipe(gulp.dest(buildPaths.html.build));
    done();
}

function html_minify(done) {
    return gulp.src(buildPaths.html.src)
        .pipe(htmlmin({
            collapseWhitespace: true,
            ignoreCustomFragments: [/<%[\s\S]*?%>/, /<\?[=|php]?[\s\S]*?\?>/]
        }))
        .pipe(gulp.dest(buildPaths.html.build));
    done();
}

function build_php(done) {
    return gulp.src(buildPaths.php.src)
        .pipe(gulp.dest(buildPaths.php.build));
    done();
}

function build_vendors(done) {
    return gulp.src(buildPaths.vendors.src)
        .pipe(gulp.dest(buildPaths.vendors.build));
    done();
}

function build_fonts(done) {
    return gulp.src(buildPaths.fonts.src)
        .pipe(gulp.dest(buildPaths.fonts.build));
    done();
}

function build_img(done) {
    return gulp.src(buildPaths.img.src)
        .pipe(gulp.dest(buildPaths.img.build));
    done();
}

function build_video(done) {
    return gulp.src(buildPaths.video.src)
        .pipe(gulp.dest(buildPaths.video.build));
    done();
}

function build_audio(done) {
    return gulp.src(buildPaths.audio.src)
        .pipe(gulp.dest(buildPaths.audio.build));
    done();
}

function build_favicon(done) {
    return gulp.src(buildPaths.favicon.src)
        .pipe(gulp.dest(buildPaths.favicon.build));
    done();
}

function build_icons(done) {
    return gulp.src(buildPaths.icons.src)
        .pipe(gulp.dest(buildPaths.icons.build));
    done();
}



exports.serve = serve;
exports.reload = reload;
exports.watch = watch;
exports.js = js;
exports.scss = scss;
exports.img = img;
exports.default = gulp.series(gulp.parallel(scss, js), gulp.parallel(watch, serve));

exports.clean_build = clean_build;
exports.build = gulp.series(
    // Clean Build Folder
    clean_build,

    // Compile CSS, JS
    gulp.parallel(scss, js),

    gulp.parallel(
        // Build CSS
        build_css,

        // Build JS
        build_js,

        // Build Vendors
        build_vendors,

        // Build Fonts
        build_fonts,

        // Build Video
        build_video,

        // Build Audio
        build_audio,

        // Build Audio
        build_favicon,

        // Build Audio
        build_icons,

        // Build HTML
        gulp.series(build_html, html_minify),

        // Build PHP
        build_php,

        // Build Images
        gulp.series(/*img,*/ build_img),
    )
);


