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
    createdb();
  },
  stop : function() {
    clearInterval(thread);
    config._db_exists = false;
  },
  send : function(id,value){
    /*console.log(id+" : "+value);*/
  },
  on : function(){
    console.log('turned on');
  },
  off : function(){
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
  dialog.showSaveDialog({ defaultPath : './data/'+config._experiment+"_"+config._date},function (fileName) {
         if (fileName === undefined){
              console.log("You didn't save the file");
              return;
         }
         fileName = (fileName.endsWith('.json')) ? fileName : fileName+'.json' ;
         config._file=fileName;
         initdb();
         thread=setInterval(read,500);
  });
  }
  else{
    thread=setInterval(read,500);
  }
}
