/* global process*/

/*
    dirty hack to prevent a annoying bug from gulp-typescript
*/

var isInTestMode = process.env.testMode === "true";
var dontCompile  = process.env.dontCompile === "true";

module.exports = (function (testMode) {
    
    
    
    var ts          = require('gulp-typescript')
    ,   Writable    = require('stream').Writable
    ,   path        = require("path")
    ,   typescript = isInTestMode? require('typescript'):undefined;//gulp-typescript bug

    var state = {
        idle                 :       0,
        compiling            :       1,
        compilationCompleted :       2
    }

    var _currentState      = state.idle;

    function factoryTypeScriptPreprocessor(logger, helper, config) {
        
        var _                = helper._;
        
        /*
            tsConfigPath must aways be present 
        */
        if(toString.call(config.tsconfigPath) !== "[object String]"){
            throw new Error("tsconfigPath was not defined");
        } 
        
                
        /*
            compilerOptions
        */
        var compilerOptions = (config.compilerOptions || config.tsconfigOverrides) || {};
        
        if(!_.isObject(compilerOptions) || _.isDate(compilerOptions)){
            throw new Error("compilerOptions if defined, show be an object.")
        }
        
        var defultCompilerOptions = {
                outDir        : undefined,
                typescript:typescript
            };
        
        _.extend(compilerOptions, defultCompilerOptions);
        
        
        /*
            It is used to change virtual path of served files
        */
        config.transformPath = config.transformPath || [function(filepath){
            return  filepath.replace(/\.ts$/i, '.js');
        }];
        
        
        if(_.isFunction(config.transformPath)){
               config.transformPath = [config.transformPath];     
        } else if(!_.isArray(config.transformPath)) {
            throw new Error("transformPath must be an array or a function");
        }        
        
         /*
            It is used to ignore files
        */
        config.ignorePath = (config.ignorePath || _.noop);
        
        if(!_.isFunction(config.ignorePath)){
            throw new Error("ignorePath must be a function")
        }
        
        var log = logger.create('preprocessor:typescript')
        ,   _compiledBuffer  = []
        ,   _servedBuffer    = []
        ,   tsProject        = ts.createProject(config.tsconfigPath, compilerOptions);
        
        function compile() {
            if(dontCompile)return;
            
            log.debug('Compiling ts files...');
            
            _currentState   = state.compiling,
            _compiledBuffer = [];
            
            var output      = Writable({ objectMode: true }),
                tsResult    = tsProject.src().pipe(ts(tsProject));

            // save compiled files in memory 
            output._write   = function (chunk, enc, next) {
                _compiledBuffer.unshift(chunk);
                next();
            };

            tsResult.js.pipe(output);
            //called at the end of compilation process
            tsResult.js.on('end', function () {
                log.debug('Compilation completed!');
                _currentState = state.compilationCompleted;
                _releaseBuffer();
            });
        }

        function dummyFile(message) {
            return "/* preprocessor:typescript --> " + message + " */"
        }

        function transformPath(filepath) {           
            return _.reduce(config.transformPath, function(memo, clb){
                //I simple ignore clb that was not function
              return _.isFunction(clb) ? clb.call(config, memo  ): memo
            }, filepath);
        }

        //responsible to flush cache and notify karma
        function _releaseBuffer() {
            var buffered;

            while (buffered = _servedBuffer.shift()) {
                _serveFile(buffered.file, buffered.done);
                //it is possible start compiling while in relese
                if (state.compilationCompleted != _currentState)
                    break;
            }
        }

        //Called in idle or compiling states
        function _feedBuffer(file, done) {
            _servedBuffer.unshift({ file: file, done: done });
        }

        //Used to fetch files from buffer 
        // if requested file contains a sha defined, 
        //it means this file was changed as karma
        function _serveFile(requestedFile, done) {
            var   compiled
                , temp = []
                , wasCompiled
                , baseName;

            log.debug("Fetching " + requestedFile.originalPath + ' from buffer');
            
            requestedFile.path  = transformPath(requestedFile.path);
            baseName            = path.basename(requestedFile.path).toString();

           
            if (requestedFile.sha) {
                delete requestedFile.sha; //simple hack i used to prevent infinite loop
                _feedBuffer(requestedFile, done);
                compile();
                return;
            }
            
            while (compiled = _compiledBuffer.shift()) {
                //TODO: improve comparation of files, as it can lead to unespected behavior
                //if two files has same name
                if (path.basename(compiled.path).toString() == baseName) {
                    wasCompiled = true;
                    done(null, compiled.contents.toString());
                } else {
                    temp.unshift(compiled);
                }
            }
            
            //refeed buffer
            _compiledBuffer = temp;

            //if file was not found in the stream
            //maybe it is not compiled or is an definition file
            if (!wasCompiled) {
                log.debug(requestedFile.originalPath + ' was not found. Maybe it was not compiled or it is a definition file.');
                done(null, dummyFile('This file was not compiled'));
            }
        }

        //first compilation
        compile();

        return function createTypeScriptPreprocessor(content, file, done) {
            
            //ignoring files
            if (!!config.ignorePath(file.path)) {
                log.debug(file.path + ' was skipped');
                done(null, dummyFile('This file was skipped'));
                return;
            }

            switch (_currentState) {
                case state.idle:
                case state.compiling:
                    log.debug(file.originalPath + ' was buffered');
                    _feedBuffer(file, done);
                    break;
                case state.compilationCompleted:
                    log.debug('Fetching ' + file.originalPath);
                    _serveFile(file, done);
                    break;
            }
        }
    }

    factoryTypeScriptPreprocessor.$inject = ['logger', 'helper', 'config.typescriptPreprocessor'];

    return {
        'preprocessor:typescript': ['factory', factoryTypeScriptPreprocessor]
    }
})();