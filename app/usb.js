var electron = require('./main.js');
var datachan = require('data-chan').lib;
var dc_search_results = require('data-chan').search_enum;
var ref = require('ref');
var arr = require('ref-array');
var f_arr = arr('float');
var struct = require('ref-struct');
var measure_t = struct({
  'type' : ref.types.uint8,
  'mu' : ref.types.uint8,
  'channel' : ref.types.uint8,
  'value' : ref.types.float,
  'time' : ref.types.uint32,
  'millis' : ref.types.uint16
});
const EventEmitter = require('events');
var handler = new EventEmitter();
var usb;
var thread;
var on=false;

var scope = {
  'time' : 0,
  'ch1'  : 0,
  'ch2'  : 0,
  'ch3'  : 0,
  'ch4'  : 0,
  'ch5'  : 0,
  'ch6'  : 0,
  'ch7'  : 0,
  'ch8'  : 0
};
var debug;
module.exports = {
  on : function(deb=false){
    datachan.datachan_init();
    on = true;
    debug=deb;
    usb=datachan.datachan_device_acquire();
    if(usb.result === dc_search_results.success){
      datachan.datachan_device_enable(usb.device);
      thread=setInterval(read,200);
    }
  },
  off : function(){
    datachan.datachan_device_disable(usb.device);
    clearInterval(thread);
    on = false;
    datachan.datachan_send_async_command(usb.device,4,new Buffer(),buf.length);
    datachan.datachan_device_release(usb.device);
    datachan.datachan_shutdown();

  },
  ison: function(){
    return on;
  },
  send_command:function(command){
    if(datachan.datachan_device_is_enabled(usb.device)){
      switch(command.id){
        case "set_current_output" :
          var buf = new Buffer(4);
          buf.writeFloatLE(command.value,0);
          datachan.datachan_send_async_command(usb.device,1,buf,buf.length);
        break;
        case "set_heater_state" :
          var buf = new Buffer([parseInt(command.value*255)]);
          datachan.datachan_send_async_command(usb.device,2,buf,buf.length);
        break;
      }
    }
  },
  handler
};

function read(){
  var measure;
  var mes;
  if(datachan.datachan_device_is_enabled(usb.device)){
    n_mes=datachan.datachan_device_enqueued_measures(usb.device);
    for(var i=0;i<n_mes;i++){
      mes = datachan.datachan_device_dequeue_measure(usb.device);
      measure =ref.deref(mes);
      if(i==n_mes-1){
        scope.time=measure.time*1000+measure.millis;
        for(i=0;i<measure.measureNum;i++){
          scope['ch'+measure.channels[i]]=measure.values[i];
        }
      }
      datachan.datachan_clean_measure(mes);
    }
  }
  else if(debug){
      scope= {
        'time' : process.hrtime(),
        'ch1' : Math.floor(Math.random() * (-1 + 5 + 1)) + 1,
        'ch2' : Math.floor(Math.random() * (-5 + 10 + 1)) + 5,
        'ch3' : Math.floor(Math.random() * (-10 + 15 + 1)) + 10,
        'ch4' : Math.floor(Math.random() * (-15 + 20 + 1)) + 15,
        'ch5' : Math.floor(Math.random() * (-20 + 25 + 1)) + 20,
        'ch6' : Math.floor(Math.random() * (-25 + 30 + 1)) + 25,
        'ch7' : Math.floor(Math.random() * (-30 + 35 + 1)) + 30,
        'ch8' : Math.floor(Math.random() * (-35 + 40 + 1)) + 35
      };
  }
  handler.emit('measure', scope);
}
