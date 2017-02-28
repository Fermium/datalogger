var electron = require('./main.js');
var low = require('lowdb'); //db .json
var _ = require('lodash');
var config = {'_file': '','_db_exists':false};
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

var mainWindow= {};
var usb_thing;
var db;
var thread;




module.exports = {
  start : function (win,diag,experiment,date) {
    _.extend(mainWindow,win);
    createdb(diag,experiment,date);
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
    console.log(electron);
    config._db_exists = false;
    config._file = '';
    datachan.datachan_init();
    usb_thing=datachan.datachan_device_acquire();
  },
  off : function(){
    datachan.datachan_device_release(usb_thing.device);
    datachan.datachan_shutdown();

  }
}

function read(){
var measure;
if(datachan.datachan_device_is_enabled(usb_thing.device)){
   measure =ref.deref(datachan.datachan_device_dequeue_measure(usb_thing.device));

}
scope= {
  'time' : measure.time*1000+measure.millis,
  'ch1' : Math.floor(Math.random() * (-1 + 5 + 1)) + 1,
  'ch2' : Math.floor(Math.random() * (-5 + 10 + 1)) + 5,
  'ch3' : Math.floor(Math.random() * (-10 + 15 + 1)) + 10,
  'ch4' : Math.floor(Math.random() * (-15 + 20 + 1)) + 15,
  'ch5' : Math.floor(Math.random() * (-20 + 25 + 1)) + 20,
  'ch6' : Math.floor(Math.random() * (-25 + 30 + 1)) + 25,
  'ch7' : Math.floor(Math.random() * (-30 + 35 + 1)) + 30,
  'ch8' : Math.floor(Math.random() * (-35 + 40 + 1)) + 35
}
mainWindow.webContents.send('measure',  {'scope':scope});
//////////////////////////////

db.get('_data').push(scope).value();


}

function initdb(experiment,date){
  db = low(config._file);
  db.defaults({ _data : [] , _experiment : '', _date : ''}).value();
  db.set(experiment,config._experiment).value();
  db.set(date,config._date).value();
  config._db_exists = true;
}

function createdb(diag,experiment,date){
  if(!config._db_exists){
  if(diag!=undefined){
    diag = (diag.endsWith('.json')) ? diag : diag+'.json' ;
    config._file=diag;
    initdb(experiment,date);
    thread=setInterval(read,100);
  }
  }
  else{
    thread=setInterval(read,100);
  }
}
