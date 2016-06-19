/// <reference path="IConfigOptions" />

import * as GulpTypescript from 'gulp-typescript';
import * as streamt from "stream";

import stream = require("stream");

class KarmaTypescriptPreprocessor2 {
    
    private compiledFilesBuffer: any[];
    
    private underscore: UnderscoreStatic;
    private tsProject: GulpTypescript.Project;
    
    Compile(gulpTypescript): stream.Writable {                      
            
            var output      =  new stream.Writable({ objectMode: true });
            var tsResult    = this.tsProject.src().pipe(gulpTypescript(this.tsProject));

           // save compiled files in memory 
            output._write   =  (chunk: File, enc, next)=> {
                this.compiledFilesBuffer[chunk.name] = chunk;
                next();
            };
            
            tsResult.js.pipe(output);

        return output;
       
    }
        
    constructor(_: UnderscoreStatic, config:IConfigOptions, gulpTypescript){
        
        var config: IConfigOptions =  {
            tsconfigPath: null,
            transformPath: (filepath)=>filepath.replace(/\.ts$/i, '.js'),
            ignorePath: (path)=> false
        }; 
        
        _.extend(config, config);
        
        this.tsProject= gulpTypescript.createProject(config.tsconfigPath, config);
        
        
        this.compiledFilesBuffer = [];
    }


}