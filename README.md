
Transpile files in memory using gulp-typescript. No temp files are generated.

[![NPM](https://nodei.co/npm/karma-typescript-preprocessor2.png?downloads=true&downloadRank=true)](https://nodei.co/npm/karma-typescript-preprocessor2/)

---

This preprocessor uses [gulp-typescript transpiler](https://www.npmjs.com/package/gulp-typescript), a great plugin mainted by [ivogabe](https://github.com/ivogabe) and other 21 contributors. Among its best features we highlight:

 - Very fast rebuilds by using incremental compilation
 - Very good error reporting handle



# How to install

First you need to include reference to this plugin in your `package.json`, just write karma-typescript-preprocessor2 (note number **2** at the end):

```JavaScript
  {
    "devDependencies": {
      "karma": "^0.13.15",
      "karma-typescript-preprocessor2": "1.2.1"
    }
  }
```
You can also install via cli:

`$ npm install karma-typescript-preprocessor2 --save-dev`

## Configuration Options

Here is a full featured example with all options that you can use to configure the preprocessor:


```javascript
// karma.conf.js 
module.exports = function(config) {
  config.set({
    files: [
      '**/*.ts'   // Preprocessor will convert Typescript to Javascript
    ],
    preprocessors: {
      '**/*.ts': ['typescript', 'sourcemap']   // Use karma-sourcemap-loader
    },
    typescriptPreprocessor: {
      // options passed to typescript compiler 
      tsconfigPath: './tsconfig.json', // *obligatory
      compilerOptions: { // *optional
        removeComments: false
      },
      // Options passed to gulp-sourcemaps to create sourcemaps
      sourcemapOptions: {includeContent: true, sourceRoot: '/src'},
      // ignore all files that ends with .d.ts (this files will not be served)
      ignorePath: function(path){ 
       return /\.d\.ts$/.test(path);
      },
      // transforming the filenames 
      // you can pass more than one, they will be execute in order
      transformPath: [function(path) { // *optional
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

By design ``karma-typescript-preprocessor2`` only allows primary configuration build by ``tsconfig.json`` . Working this way, a lot of problems with typos and references are completely solved, as compiler will use same ``basedir`` to resolve files, but you can always override (or include) new options by using ``compilerOptions`` property.

## Unsuported typescript configuration options
As we use gulp-typescript to transpiler typescript code, we have the same unsuported properties as theirs, so:

 - Sourcemap options (sourceMap, inlineSources, sourceRoot)
 - rootDir - Use base option of gulp.src() instead.
 - watch - Use karma ``singleRun: false`` configuration instead.
 - project - See "Using tsconfig.json".
 - 
And obvious ones: help, version

## Sourcemaps
Transpiling with gulp-typescript requires the use of gulp-sourcemaps to create sourcemaps.

## Plugin Options

Below there are list of plugin options

### transformPath:  (string)=> string |  ((string) => string)[]

default value:
```
function(path){
 return path.replace(/\.ts$/, '.js');//replace .ts to .js from virtual path
}

```

It is used to change virtual path of served files. Sometimes it should be necessary to change virtual directory of a served file to allow tests, example:

Let's suppose that you have the following folder hierarchy:

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

If ``file1.spec.ts`` and ``file2.spec.ts`` reference ``file1.ts`` and ``file2.ts``, and you are using typescript ``module`` option, you will need to remove virtual directory ``test``, so all modules referenced by ``*.specs.ts`` will be solved successfully. To make it work, you just need to write something like:

```
// karma.conf.js 
(...)
typescriptPreprocessor: {
  // options passed to the typescript compiler 
  tsconfigPath: './tsconfig.json', //*obligatory
  compilerOptions: {//*optional
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

[Here](https://github.com/klaygomes/angular-typescript-jasmine-seed) there is a simple example seed where you can see what is described here in action. 

### ignorePath: (string)=> boolean

It could be used to ignore files that you don't want to serve. Keep in mind that  ``ignorePath`` runs before ``transformPath``

default value:
```
function(path){
 return /\.d\.ts$//.test(path);
}

```

### sourcemapOptions: any

Specify ``gulp-sourcemaps`` write options. Inline sourcemaps are the easiest to configure for testing. For more info [see gulp-sourcemaps write options](https://www.npmjs.com/package/gulp-sourcemaps).

### compilerOptions: any

You can provide or override any compiler options avaliable by ``gulp-typescript``, for more info [you can access gulp-typescript project options](https://github.com/ivogabe/gulp-typescript#options).

## License

``karma-typescript-preprocessor2`` is licensed under the [MIT license](https://github.com/klaygomes/karma-typescript-preprocessor2/blob/master/LICENSE).


Need help? Open an issue :)







