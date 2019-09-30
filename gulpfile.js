const gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    image = require('gulp-image');

const ProxyServer = false;
const domain = 'localhost/gulp/app';
const root = 'app';

gulp.task('browser-sync', function () {
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
});

gulp.task('browser-reload', function (done) {
    browserSync.reload();
    done();
});

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
    }
};

gulp.task('watch', ['browser-sync', 'scss', 'js'], function () {
    gulp.watch(paths.scss.src, ['scss']);
    gulp.watch(paths.js.src, ['js', 'browser-reload']);
    gulp.watch("app/**/*.html", ['browser-reload']);
    gulp.watch("app/**/*.php", ['browser-reload']);
    gulp.watch("app/assets/js/**/**/*.js", ['browser-reload']);
    gulp.watch("app/assets/vendors/**/*", ['browser-reload']);
    gulp.watch(paths.img.src, ['browser-reload']);
});

gulp.task('js', function (done) {
    gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(rename("main.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
    done();
});

gulp.task('scss', function (done) {
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notify.onError({
            message: "<%= error.message %>",
            title: "Sass Error!"
        })))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
    done();
});

gulp.task('img', function (done) {
    gulp.src(paths.img.src)
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
});

gulp.task('default', ['watch']);