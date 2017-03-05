var remote = require('electron').remote;
var config = remote.getGlobal('config');
var formula = remote.getGlobal('formula');
var scope = remote.getGlobal('scope');
var json2csv = require('json2csv');
/*var json2xls = require('json2xls');*/
var math = require('mathjs');
var fs = require('fs');
var fsPath = require('fs-path');
import $ = require("jquery");
var cols =[
    'time',
    {
      label: 'Hall Voltage',
      value: function(row, field, data) {
        var i;
        for(i=1;i<8;i++){
          scope['ch'.concat(i)]=row['ch'.concat(i)];
        }

        return math.eval(formula['vh'],scope);
      }
    },
    {
      label: 'Current',
      value: function(row, field, data) {
      return math.eval(formula['I'],scope);
      }
    },
    {
      label: 'VR',
      value: function(row, field, data) {
        return math.eval(formula['r-mes'],scope);
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
        return math.eval(formula['B'],scope);
      }
    },
    {
      label: 'Temperature',
      value: function(row, field, data) {
        return math.eval(formula['temp'],scope);
      }
    },

  ];

$('#tocsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'/experiment_data.csv';

	json2csv({ data: data['_data'] , fields:cols}, (err,csv) => {
		if (err) throw err;
    fsPath.writeFile(name, csv, function(err) {
        if(err) throw err;
    });
	});
});
$('#totsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'/experiment_data.tsv'
  console.log((config._file.split('.')[0]).split('/')[-1]);
	json2csv({ data: data['_data'] , fields: cols, del: '\t'}, (err,csv) => {
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
