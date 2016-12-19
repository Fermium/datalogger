var app = require('electron').remote;
var dialog = app.dialog;
var low = require('lowdb'); //db .json
var _ = require('lodash');
var config = app.getGlobal('config');
var scope = app.getGlobal('scope');
var units = app.getGlobal('measure');
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



module.exports = {
  start : function () {
    $.blockUI();
    createdb();
    $.unblockUI();
    datachan.datachan_device_enable(usb_thing.device);
    return config._db_exists;
  },
  stop : function() {
    datachan.datachan_device_disable(usb_thing.device);
    clearInterval(thread);
  },
  send : function(id,value){
  },
  on : function(){
    datachan.datachan_init();
    usb_thing=datachan.datachan_device_acquire();
  },
  off : function(){
    datachan.datachan_device_release(usb_thing.device);
    datachan.datachan_shutdown();
    config._db_exists = false;
    config._file = '';
  }
}

function read(){
var measure;
if(datachan.datachan_device_is_enabled(usb_thing.device)){
   measure =ref.deref(datachan.datachan_device_dequeue_measure(usb_thing.device));

}
scope['ch'.concat(measure.channel.toString())] = _.cloneDeep(math.unit(measure.value,(measure.mu in units)?units[measure.mu]:'V'));
//////////////////////////////

db.get('_data').push({
  /*'timestamp': scope.timestamp,
  'ch1': scope.ch1,
  'ch2': scope.ch2,
  'ch3': scope.ch3,
  'ch4': scope.ch4,
  'ch5': scope.ch5,
  'ch6': scope.ch6,
  'ch7': scope.ch7,
  'ch8': scope.ch8,*/
  'time' : measure.time,
  'millis' : measure.millis,
  'value' : measure.value,
  'mu' : (measure.mu in units)?units[measure.mu]:'V',
  'channel' : measure.channel
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
