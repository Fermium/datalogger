/*jshint esversion: 6*/
" use strict";
//var logger = require('./logger.js');
var fs = require('fs');
var path = require('path');
var fsPath = require('fs-path');
var json2csv = require('json2csv');
var math = require('mathjs');
var _ = require('lodash');
/*/var remote = require('electron').remote;
var config = remote.getGlobal('config');
var formula = remote.getGlobal('formula');
var scope = remote.getGlobal('scope');
/*var json2xls = require('json2xls');*/
/*
var cols = [
    'time',
    {
        label: 'Hall Voltage',
        value: function (row, field, data) {
            var i;
            for (i = 1; i < 8; i += 1) {
                scope['ch'.concat(i)] = row['ch'.concat(i)];
            }

            return math.eval(formula.vh,scope);
        }
    },
    {
        label: 'Current',
        value: function(row, field, data) {
            return math.eval(formula.I,scope);
        }
    },
    {
        label: 'VR',
        value: function(row, field, data) {
            return math.eval(formula.r-mes,scope);
        }
    },
    {
        label: 'Resistance',
        value: function(row, field, data) {
            return math.eval(formula['r-cal'],scope);
        }
    },
    {
        label: 'Gauss',
        value: function(row, field, data) {
            return math.eval(formula.B,scope);
        }
    },
    {
        label: 'Temperature',
        value: function(row, field, data) {
            return math.eval(formula.temp,scope);
        }
    },

  ];

$('#tocsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'/experiment_data.csv';

	json2csv({ data: data._data , fields:cols}, (err,csv) => {
  		if (err) throw err;
      fsPath.writeFile(name, csv, function(err) {
          if(err) throw err;
      });
	});
});
$('#totsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'/experiment_data.tsv';
  console.log((config._file.split('.')[0]).split('/')[-1]);
	json2csv({ data: data._data , fields: cols, del: '\t'}, (err,csv) => {
		if (err) throw err;
    fsPath.writeFile(name, csv, function(err) {
        if(err) throw err;
    });
	});
});
/*$('#toxls').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  	var name = config._file.split('.')[0]+'.xls';
  	var xls = json2xls(data['_data'],{fields: cols});
  	fs.writeFileSync(name,xls,'binary');
});
*/

var values={};
var cols = [];
function export_data(file,sep,extension){
  var data = JSON.parse(fs.readFileSync(file, 'utf8'));
  var name = path.dirname(file)+'/'+path.basename(file,'.json')+'/experiment_data.'+extension;

	json2csv({ data: data._data , fields:cols,del: sep}, (err,csv) => {
  		if (err) console.log(err);
      fsPath.writeFile(name, csv, function(err) {
          if(err) console.log(err);
          else process.send({action:'end'});
      });
	});
}
function init_math(mathsh,to_export){

    cols.push('time');
    for(var i in to_export){
      cols.push(_.clone({
        label: to_export[i],
        value: function(row,field,data){
          values=math.eval(mathsh,row);
          console.log(this.label);
          console.log(row[this.label].value);
          return row[this.label].value;
        }
      }));
    }
  }
  /*function scidavis(){
    var file = logger.getfile();
    var data = JSON.parse(fs.readFileSync(file, 'utf8'));
    var name = path.dirname(file)+path.basename(file,'.json')+'/tmp.tsv';
  	json2csv({ data: data._data ,fields:this.cols,del: '\t'}, (err,csv) => {
    		if (err) throw err;
        fsPath.writeFile(name, csv, function(err) {
            if(err) throw err;
            else{
              require('child_process').exec('scidavis '+name);
            }
        });
  	});
  }
};
*/
var data=JSON.parse(process.argv[2]);
init_math(data.math,data.to_export);
export_data(data.file,data.ex.sep,data.ex.extension);
