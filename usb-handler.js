var app = require('electron').remote;
var dialog = app.dialog;
var low = require('lowdb'); //db .json
var _ = require('lodash');
var config = app.getGlobal('config');

var db;
var thread;

// Momentaneo per develop //
var reading = {'series': null,'timestamp': 0, 'value': 0};
var i=0;
// ********************* //

config._experiment = 'experiment 1'; // letto da usb (?)



module.exports = {
  start : function () {
    $.blockUI();
    createdb();
    $.unblockUI();
    console.log(config._db_exists);
    return config._db_exists;
  },
  stop : function() {
    clearInterval(thread);
  },
  send : function(id,value){
    /*console.log(id+" : "+value);*/
  },
  on : function(){
    console.log('turned on');
  },
  off : function(){
    config._db_exists = false;
    config._file = '';
    console.log("turned off");
  }
}

function read(){
  ///////////////////////////////
 /*********FAKE READING********/
///////////////////////////////
reading.series = 'test';
reading.timestamp = i++;
reading.value = Math.random();
//////////////////////////////

db.get('_data').push({'series': reading.series , 'timestamp': reading.timestamp, 'value': reading.value}).value();


}


function initdb(){
  db = low(config._file);
  db.defaults({ _data : [] , _experiment : '', _date : ''}).value();
  db.set('_experiment',config._experiment).value();
  db.set('_date',config._date).value();
  config._db_exists = true;
}

function createdb(){
  if(!config._db_exists){
  diag=dialog.showSaveDialog({ defaultPath : './data/'+config._experiment+"_"+config._date,title: 'Experiment file save location'});
  if(diag!=undefined){
    diag = (diag.endsWith('.json')) ? diag : diag+'.json' ;
    config._file=diag;
    initdb();
    thread=setInterval(read,500);
  }
  }
  else{
    thread=setInterval(read,500);
  }
}
