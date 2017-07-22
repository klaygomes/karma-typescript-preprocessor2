const ts = require("gulp-typescript")
    , sourcemaps = require("gulp-sourcemaps")
    , Writable = require("stream").Writable
    , path = require("path")
    , isObject = require("lodash.isobject")
    , isDate = require("lodash.isdate")
    , isArray = require("lodash.isarray")
    , isFunction = require("lodash.isfunction")
    , assignIn = require("lodash.assignin")
    , reduce = require("lodash.reduce")
    , sep = path.sep;

const state = {
    idle: 0,
    compiling: 1,
    compilationCompleted: 2
};

let _currentState = state.idle;

function factoryTypeScriptPreprocessor(logger, config, basePath) {
    "use strict";
    /*
        tsConfigPath must aways be present
     */

    if (toString.call(config.tsconfigPath) !== "[object String]") {
        throw new Error("tsconfigPath was not defined");
    }

    /*
        compilerOptions
     */
    let compilerOptions = (config.compilerOptions || config.tsconfigOverrides) || {};

    if (!isObject(compilerOptions) || isDate(compilerOptions)) {
        throw new Error("compilerOptions if defined, must be an object.");
    }

    let defaultCompilerOptions = {
        outDir: undefined,
        typescript: undefined
    };

    assignIn(defaultCompilerOptions, compilerOptions);


    /*
     It is used to change virtual path of served files
     */
    config.transformPath = config.transformPath || [(filepath)=> filepath.replace(/\.ts$/i, ".js")];


    if (isFunction(config.transformPath)) {
        config.transformPath = [config.transformPath];
    } else if (isArray(config.transformPath)) {
        throw new Error("transformPath must be an array or a function");
    }

    /*
     It is used to ignore files
     */
    config.ignorePath = config.ignorePath || function(){/*empty*/};

    if (!isFunction(config.ignorePath)) {
        throw new Error("ignorePath must be a function");
    }

    let log = logger.create("preprocessor:typescript")
        , _compiledBuffer = []
        , _servedBuffer = []
        , tsconfigPath = path.resolve(basePath, config.tsconfigPath)
        , tsProject = ts.createProject(tsconfigPath, compilerOptions);


    function transformPath(filepath) {
        return reduce(config.transformPath, function (memo, clb) {
            //I simple ignore clb that was not function
            return isFunction(clb) ? clb.call(config, memo) : memo;
        }, filepath);
    }

    //Used to normalize file paths
    function _normalize(path) {
        return transformPath(path.replace(/[\/\\]/g, sep));
    }

    //Used in idle or compiling states
    function _feedBuffer(file, done) {
        _servedBuffer.unshift({file: file, done: done});
    }

    function dummyFile(message) {
        return `/* preprocessor:typescript --> ${message} */`;
    }

    //Used to fetch files from buffer
    // if requested file contains a sha defined,
    //it means this file was changed by karma
    function _serveFile(requestedFile, done) {
        let compiled
            , temp = []
            , wasCompiled;

        log.debug(`Fetching ${transformPath(requestedFile.path)} from buffer`);


        if (requestedFile.sha) {
            delete requestedFile.sha; //simple hack i used to prevent infinite loop
            _feedBuffer(requestedFile, done);
            compile();
            return;
        }

        while (compiled = _compiledBuffer.shift()) {
            if (_normalize(compiled.path) === _normalize(requestedFile.path)) {
                wasCompiled = true;
                done(null, compiled.contents.toString());
            } else {
                temp.unshift(compiled);
            }
        }

        //refeed buffer
        _compiledBuffer = temp;

        //if file was not found in the stream
        //maybe it is not compiled or it is a definition file, so we don't need to worry about
        if (!wasCompiled) {
            log.debug(`${requestedFile.originalPath} was not found. Maybe it was not compiled or it is a definition file.`);
            done(null, dummyFile("This file was not compiled"));
        }
    }

    function compile() {
        log.debug("Compiling ts files...");

        _currentState = state.compiling;
        _compiledBuffer = [];

        let output = Writable({objectMode: true}),
            tsResult = tsProject.src()
                .pipe(sourcemaps.init())
                .pipe(ts(tsProject));

        // save compiled files in memory
        output._write = function (chunk, enc, next) {
            _compiledBuffer.unshift(chunk);
            next();
        };

        tsResult.js
            .pipe(sourcemaps.write(config.sourcemapOptions || {}))
            .pipe(output);

        //called at the end of compilation process
        tsResult.js.on("end", function () {
            //responsible to flush the cache and notify karma
            log.debug("Compilation completed!");
            _currentState = state.compilationCompleted;
            let buffered;
            while (buffered = _servedBuffer.shift()) {
                _serveFile(buffered.file, buffered.done);
                //it is possible to start compiling while releasing files
                if (state.compilationCompleted !== _currentState){
                    break;
                }
            }
        });
    }

    //first compilation
    compile();

    return function createTypeScriptPreprocessor(/*ignored*/_, file, done) {

        //ignoring files
        if (!!config.ignorePath(file.path)) {
            log.debug(`${file.path} was skipped`);
            done(null, dummyFile("This file was skipped"));
            return;
        }

        switch (_currentState) {
            case state.idle:
            case state.compiling:
                log.debug(`${file.originalPath} was buffered`);
                _feedBuffer(file, done);
                break;
            case state.compilationCompleted:
                log.debug(`Fetching ${file.originalPath}`);
                _serveFile(file, done);
                break;
        }
    };
}

factoryTypeScriptPreprocessor.$inject = ["logger", "config.typescriptPreprocessor", "config.basePath"];


module.exports = {
    "preprocessor:typescript": ["factory", factoryTypeScriptPreprocessor]
};
