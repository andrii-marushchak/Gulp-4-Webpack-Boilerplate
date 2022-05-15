"use strict";

const pluginName = 'gulp-avif-webp'

const util = require('gulp-util')
const PluginError = util.PluginError

const through = require('through2')

module.exports = function (extensions) {
    // support extensions in lower/upper case
    var extensions = extensions || ['.jpg', '.jpeg', '.png']
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file)
            return
        }

        if (file.isStream()) {
            cb(new PluginError(pluginName, 'Streaming not supported'))
            return
        }

        try {
            var inPicture = false

            const data = file.contents
                .toString()
                .split('\n')
                .map(function (line) {

                    if (line.indexOf('<picture') + 1) inPicture = true
                    if (line.indexOf('</picture') + 1) inPicture = false

                    if (line.indexOf('<img') + 1 && !inPicture) {
                        let Re = /<img([^>]+)src=[\"\'](\S+)[\"\']([^>\/]+)\/?>/gi
                        let regexpArray = Re.exec(line)
                        let imgTag = regexpArray[0] // orig image tag
                        let srcImage = regexpArray[2] // src URL
                        let newAvifUrl = srcImage // for new URL avif
                        let newWebpUrl = srcImage // for new URL webp

                        if (srcImage.indexOf('.webp') + 1) return line

                        extensions.forEach(ext => {

                            if (srcImage.indexOf(ext) == -1) {

                                return line;

                            } else {

                                newAvifUrl = newAvifUrl.replace(ext, '.avif')
                                newWebpUrl = newWebpUrl.replace(ext, '.webp')

                                switch (ext) {
                                    case '.jpg':
                                        line = `<picture>${imgTag}<source srcset="${newAvifUrl}" type="image/avif"><source srcset="${newWebpUrl}" type="image/webp"></picture>`
                                        break;

                                    case '.jpeg':
                                        line = `<picture>${imgTag}<source srcset="${newAvifUrl}" type="image/avif"><source srcset="${newWebpUrl}" type="image/webp"></picture>`
                                        break;

                                    case '.png':
                                        line = `<picture><source srcset="${newAvifUrl}" type="image/avif"><source srcset="${newWebpUrl}" type="image/webp">${imgTag}</picture>`
                                        break;

                                    default:
                                        line = imgTag
                                }
                            }
                        });

                        return line
                    }
                    return line
                })
                .join('\n')

            file.contents = new Buffer.from(data)

            this.push(file)
        } catch (err) {
            this.emit('error', new PluginError(pluginName, err))
        }

        cb()
    })
}