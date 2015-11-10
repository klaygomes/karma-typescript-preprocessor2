This preprocessor uses [gulp-typescript transpiler](https://www.npmjs.com/package/gulp-typescript) a great plugin mainted by [ivogabe](https://github.com/ivogabe) and other 21 contributors. Among its best fetuares we highlight:

 - Very fast rebuilds by using incremental compilation
 - Very good error reporting handle



# How to install

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


```javascript
// karma.conf.js 
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
      ignorePath: function(path){//ignore all files that ends with .d.ts (this files will not be served)
       return /\.d\.ts$/.test(path);
      },
      // transforming the filenames 
      //you can pass more than one, they will be execute in order
      transformPath: [function(path) {//*optional
        return path.replace(/\.ts$/, '.js');
      }, function(path) {
         return path.replace(/[\/\\]test[\/\\]/i, '/'); // remove directory test and change to /
      }]
    }
  });
};
```

```javascript
//tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "module": "amd",
    "noEmitOnError": false,
    "removeComments": true,
    "sourceMap": true,
    "listFiles": true,
    "experimentalDecorators": true,
    "outDir": "wwwroot",
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

## Unsuported typescript configuration options
As we use gulp-typescript to transpiler typescript code, we have same unsuported properties as they have, so:

 - Sourcemap options (sourceMap, inlineSources, sourceRoot)
 - rootDir - Use base option of gulp.src() instead.
 - watch - Use karma ``singleRun: false`` configuration instead.
 - project - See "Using tsconfig.json".
 - 
And obvious ones: help, version

## Plugin Options

Below there are list of plugin options

### transformPath:  (string)=> string |  ((string) => string)[]

defualt value:
```
function(path){
 return path.replace(/\.ts$/, '.js');//replace .ts to .js from virtual path
}

```

It is used to change virtual path of served files. Some times it should be necessary to change virtual directory of a served file to permit tests, example:

Lets supose that you have the following folder hierarchy:

```
\basedir
 \wwwroot
  module
     file1.js
     file2.js
 \src
   module
     file1.ts
     file2.ts
 \test
   module
     file1.spec.ts
     file2.spec.ts
```

If ``file1.spec.ts`` and ``file2.spec.ts`` reference ``file1.ts`` and ``file2.ts`` and you are using typescript ``module`` option, you will need remove virtual directory ``test``, so modules referenced by ``*.specs.ts`` will be resolved sucefully, to make it work you just need write something like:

```
// karma.conf.js 
(...)
typescriptPreprocessor: {
  // options passed to the typescript compiler 
  tsconfigPath: './tsconfig.json', //*obligatory
  tsconfigOverrides: {//*optional
    removeComments: false
  },
  // transforming the filenames 
  // you can pass more than one, they will be execute in order
  transformPath: [function(path) {//
   return path.replace(/\.ts$/, '.js'); // first change .ts to js
 }, function(path) {
   return path.replace(/[\/\\]test[\/\\]/i, '/'); // remove directory test and change to /
  }]
}
(...)
```

[Here](https://github.com/klaygomes/angular-typescript-jasmine-seed) there is a simple example seed that you can see this in action. 

### ignorePath: (string)=> boolean

It could be used to ignore files that you don't want to serve. 

### tsconfigOverrides: any

You can provide or override any options avaliable by ``gulp-typescript``, for more info [you can access gulp-typescript project options](https://github.com/ivogabe/gulp-typescript#options).

### License

``karma-typescript-preprocessor2`` is licensed under the [MIT license](https://github.com/klaygomes/karma-typescript-preprocessor2/blob/master/LICENSE).


Needs help? Open an issue :)







