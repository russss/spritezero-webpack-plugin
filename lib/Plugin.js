const spritezero = require('@mapbox/spritezero');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

module.exports = class SpritezeroPlugin {
  constructor(options) {
    this.options = {
      'source': options.source || 'sprites/',
      'output': options.output || 'style/'
    }
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'SpritezeroPlugin',
      async (compilation, callback) => {
        await this.compile(compilation);
        callback();
      },
    );

    compiler.hooks.afterCompile.tap('after-compile', compilation => {
      this.getFiles().forEach(f => {
        compilation.fileDependencies.add(f);
      });
    });
  }

  getFiles() {
    return glob.sync(this.options.source);
  }

  async compile(compilation) {
    for (var pxRatio of [1, 2]) {
      var svgs = this.getFiles().map(f => {
        return {
          svg: fs.readFileSync(f),
          id: path.basename(f).replace('.svg', ''),
        };
      });

      var basename;
      if (pxRatio == 1) {
        basename = this.options.output + 'sprite';
      } else {
        basename = this.options.output + 'sprite@' + pxRatio + 'x';
      }

      var json_data = await this.compileLayout(svgs, pxRatio, true);
      compilation.assets[basename + '.json'] = {
        source: () => json_data,
        size: () => json_data.length,
      };

      var img_data = await this.compileLayout(svgs, pxRatio, false);
      compilation.assets[basename + '.png'] = {
        source: () => img_data,
        size: () => img_data.length,
      };
    }
  }

  compileLayout(svgs, pxRatio, format) {
    return new Promise((resolve, reject) => {
      spritezero.generateLayout(
        {imgs: svgs, pixelRatio: pxRatio, format: format},
        (err, data) => {
          if (err) {
            reject(err);
          }
          if (format) {
            resolve(JSON.stringify(data));
          } else {
            spritezero.generateImage(data, function(err, image) {
              if (err) {
                reject(err);
              }
              resolve(image);
            });
          }
        },
      );
    });
  }
};
