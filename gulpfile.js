const gulp = require('gulp');
        
const gulpLoadPlugins = require('gulp-load-plugins');
const gp = gulpLoadPlugins();
const fs = require('fs');
const del = require('del');
const browserSync = require('browser-sync').create();

const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
 
const paths = {
    
    root: './build',
    
    pug: {
        pages: './src/pug/pages/*.pug',
        src: './src/pug/**/*.pug',
        dest: './build'
    },
    
    styles: {
        main: './src/styles/main.scss',
        src: './src/styles/**/*.scss',
        dest: './build/css'
    },
    
    scripts: {
        src: './src/scripts/*.js',
        dest: './build/scripts',
        watch: './src/scripts/**/*.js'
    },
    
    svgSprite: {
        src: './src/images/icons/*.svg',
        dest: './build/img/icons',
        watch: './src/images/icons/*.svg',
    }
};

// очистка
function clean() {
    return del(paths.root);
}

// pug
function templates(){
    return gulp.src(paths.pug.pages)
    .pipe(gp.pug({
        locals : JSON.parse(fs.readFileSync('./src/content.json', 'utf8')),
        pretty: true
    }))
    .on('error', gp.notify.onError(function (error) {
        return {
            title: 'Pug',
            message: error.message
        }
    }))
    .pipe(gulp.dest(paths.root));
};

// scss
function styles() {
    return gulp.src(paths.styles.main)
        .pipe(gp.sassGlob())
        .pipe(gp.sourcemaps.init())
        .pipe(gp.sass({
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', gp.notify.onError({
            title: 'style'
        })))
        .pipe(gp.autoprefixer({
            browsers: [
                'last 3 version',
                '> 1%',
                'ie 8',
                'ie 9',
                'Opera 12.1'
            ]
        }))
        // .pipe(gp.cssUnit({
        //     type     :    'px-to-rem',
        //     rootSize :    16
        // }))
        .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
}

// webpack
function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(paths.scripts.dest))
}

// server
function serve() {
    browserSync.init({
        open: false,
        server: {
            baseDir: "./build"
        }
    });
    // gulp.watch("./build").on("change", browserSync.reload);
}

// watch
function watch() {
    gulp.watch(paths.pug.src, gulp.series(templates, reload));
    gulp.watch(paths.styles.src, gulp.series(styles, reload));
    gulp.watch(paths.scripts.watch, gulp.series(scripts, reload));
    gulp.watch('./src/images/**/*', gulp.series(images, reload));
    gulp.watch(paths.svgSprite.watch, gulp.series(svgSprite, reload));
    gulp.watch('./src/fonts/**/*', gulp.series(fonts, reload));
    gulp.watch('./src/content.json', gulp.series(templates, reload));
}

function reload(done){
    browserSync.reload();
    done();
}

function images(){
    return gulp.src([ './src/images/**/*', '!./src/images/icons/**/*'])
        .pipe(gulp.dest('./build/img'))
}

function svgSprite(){
    return gulp.src(paths.svgSprite.src)
        .pipe(gp.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gp.cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(gp.replace('&gt;', '>'))
        .pipe(gp.svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest(paths.svgSprite.dest))
}

function fonts(){
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./build/fonts'))
}

exports.templates = templates;
exports.styles = styles;
exports.scripts = scripts;
exports.clean = clean;
exports.serve = serve;
exports.watch = watch;
exports.svgSprite = svgSprite;
exports.images = images;
exports.fonts = fonts;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        images,
        svgSprite,
        fonts,
        styles,
        scripts, 
        templates
    ),
    gulp.parallel(
        watch,
        serve
    )
));