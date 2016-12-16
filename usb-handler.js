var app = require('electron').remote;
var dialog = app.dialog;
var low = require('lowdb'); //db .json
var _ = require('lodash');
var config = app.getGlobal('config');
var scope = app.getGlobal('scope');
var math = require('mathjs');
var datachan = require('data-chan').lib;
var dc_search_results = require('data-chan').search_enum;
var ref = require('ref');
var struct = require('ref-struct');

var measure_t = struct({
  'type' : ref.types.uint8,
  'mu' : ref.types.uint8,
  'channel' : ref.types.uint8,
  'value' : ref.types.float,
  'time' : ref.types.uint32,
  'millis' : ref.types.uint16
});


var usb_thing;
var db;
var thread;

// Momentaneo per develop //
//var reading = {'series': null,'timestamp': 0, 'ch1': 0,'ch2':0,'ch3':0,'a':0,'b':0};
var i=0;
// ********************* //




module.exports = {
  start : function () {
    $.blockUI();
    createdb();
    $.unblockUI();
    datachan.datachan_device_enable(usb_thing.device);
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
    datachan.datachan_init();
    usb_thing=datachan.datachan_device_acquire();
  },
  off : function(){
    config._db_exists = false;
    config._file = '';
  }
}

function read(){
  ///////////////////////////////
 /*********FAKE READING********/
///////////////////////////////
scope.timestamp = i++;
var locscope = {
  'ch1' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch2' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch3' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch4' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch5' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch6' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch7' : math.unit(math.round(math.random(0,5),2),'V'),
  'ch8' : math.unit(math.round(math.random(0,5),2),'V')
}
if(datachan.datachan_device_is_enabled(usb_thing.device))
  console.log(ref.deref(datachan.datachan_device_dequeue_measure(usb_thing.device)));
_.merge(scope,locscope);

//////////////////////////////

db.get('_data').push({
  'timestamp': scope.timestamp,
  'ch1': scope.ch1,
  'ch2': scope.ch2,
  'ch3': scope.ch3,
  'ch4': scope.ch4,
  'ch5': scope.ch5,
  'ch6': scope.ch6,
  'ch7': scope.ch7,
  'ch8': scope.ch8,
}).value();


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
