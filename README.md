This preprocessor uses [gulp-typescript transpiler](https://www.npmjs.com/package/gulp-typescript) a great plugin mainted by [ivogabe](https://github.com/ivogabe) and other 21 contributors. Among its best fetuares we highlight:

 - Very fast rebuilds by using incremental compilation
 - Very good error reporting handle



# How to install this plugin

First you need include reference to this plugin in your `package.json`, just write karma-typescript-preprocessor2 (note number **2** at the end):

```JavaScript
  {
    "devDependencies": {
      "karma": "^0.13.15",
      "karma-typescript-preprocessor2": "1.0.0"
    }
  }
```
You can also install by command line typing:

`$ npm install karma-typescript-preprocessor2 --save-dev`

## Configuration Options

Below we show a full featured example with all options that you can use to configure the preprocessor:

// karma.conf.js 
```javascript
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.ts': ['typescript']
    },
    typescriptPreprocessor: {
      // options passed to the typescript compiler 
      tsconfigPath: './tsconfig.json', //*obligatory
      
      tsconfigOverrides: {//*optional
        removeComments: false
      },
      // transforming the filenames 
      //you can pass more than one, they will be execute in order
      transformPath: [function(path) {//*optional
        return path.replace(/\.ts$/, '.js');
      }, [function(path) {
        return path.replace(/\.ts$/, '.js');
      }]
    }
  });
};
```
//tsconfig.json
```javascript
{
  "compilerOptions": {
    "noImplicitAny": false,
    "module": "amd",
    "noEmitOnError": false,
    "removeComments": true,
    "sourceMap": true,
    "listFiles": true,
    "experimentalDecorators": true,
    "target": "es5"
  },
  "exclude": [
    "node_modules",
    "wwwroot",
    "artifacts"
    ".git",
    ".vs"
  ]
}
```

By design ``karma-typescript-preprocessor2`` only allows primary configuration build by ``tsconfig.json`` as this way a lot of problems with typings and references are completed resolved, as compiler will use same ``basedir`` to resolve files, but you can always override (or include) new options by using ``tsconfigOverrides`` property.
