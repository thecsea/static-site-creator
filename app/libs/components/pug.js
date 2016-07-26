/**
 * Created by claudio on 26/07/16.
 */

var pugLib = require('pug');
var fs = require('fs');


var template = fs.readFileSync(__dirname + '/template.pug', 'utf-8');
var templateCompiled = pugLib.compile(template, {});

class pug{
    constructor(structure){
        this._html = '';
        this._structure = structure;
    }

    get structure() {
        return this._structure;
    }

    set structure(value) {
        this._structure = value;
    }

    get html() {
        return this._html;
    }

    set html(value) {
        this._html = value;
    }

    parse(){
        this.html = templateCompiled({structure: this.structure})
        return this;
    }
}

module.exports = pug;
