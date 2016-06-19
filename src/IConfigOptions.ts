interface  IConfigOptions {
    tsconfigPath: string;
    /**
     * Used to transform files paths.
     */
    transformPath?: (path:string)=>string | ((path:string)=>string)[];
    /**
     * Use to ignore paths at you will
     */
    ignorePath?:  (path:string)=>string | ((path:string)=>string)[];
    /**
     * Options passed to gulp-typescript.
     * All options avaliable by gulp-typescript can be configured here 
     */
    compilerOptions?: any;
}