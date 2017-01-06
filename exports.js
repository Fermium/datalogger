var remote = require('electron').remote;
var config = remote.getGlobal('config');
var json2csv = require('json2csv');
var json2xls = require('json2xls');
var fs = require('fs');

$('#tocsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'.csv';
	json2csv({ data: data['_data'] , fields: Object.keys(data['_data'][0])}, (err,csv) => {
		if (err) throw err;
    fs.writeFile(name, csv, function(err) {
        if(err) throw err;
    });
	});
});



$('#totsv').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  var name = config._file.split('.')[0]+'.tsv';
	json2csv({ data: data['_data'] , fields: Object.keys(data['_data'][0]), del: '\t'}, (err,csv) => {
		if (err) throw err;
    fs.writeFile(name, csv, function(err) {
        if(err) throw err;
    });
	});
});

$('#toxls').click(function(){
  var data = JSON.parse(fs.readFileSync(config._file, 'utf8'));
  	var name = config._file.split('.')[0]+'.xls';
  	var xls = json2xls(data['_data']);
  	fs.writeFileSync(name,xls,'binary');
});
