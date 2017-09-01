/*jshint esversion: 6*/

//sends an error down the IPC
function dispatch_error(message, e) {
  process.send({
    action: 'error',
    message: message,
    payload: e
  });
}

var datachan = require('data-chan').lib;
var dc_search_results = require('data-chan').search_enum;
var MAX_MEASURE_NUM = require('data-chan').MAX_MEASURE_NUM;


var ref = require('ref');
var arr = require('ref-array');
var f_arr = arr('float');
var struct = require('ref-struct');

var measure_t = struct({
  'type': ref.types.uint8,
  'mu': ref.types.uint8,
  'measureNum': ref.types.uint8,
  'channels': arr(ref.types.uint8, MAX_MEASURE_NUM),
  'values': arr(ref.types.float, MAX_MEASURE_NUM),
  'time': ref.types.uint32,
  'millis': ref.types.uint16
});

var device;
var thread;

function on(vid, pid) {
  console.log("USB on with VID", vid, "and PID", pid)

  datachan.datachan_init();

  device = datachan.datachan_device_acquire(vid, pid);


  if (device.result === dc_search_results.success) {
    datachan.datachan_device_enable(device.device);
    process.send({
      action: 'usb-init'
    });
    thread = setInterval(read, 200);
  }
  return (device.result === dc_search_results.success);
}


function off() {
  console.log("USB off")
  if (device.result === dc_search_results.success) {
    datachan.datachan_device_disable(device.device);
    clearInterval(thread);
    datachan.datachan_device_release(device.device);
    datachan.datachan_shutdown();
  }
}

function send_command(command) {
  console.log("sending USB command ", command)
  var buf;
  if (datachan.datachan_device_is_enabled(device.device)) {
    switch (command.id) {
      case "set_current_output":
        buf = new Buffer(4);
        buf.writeFloatLE(command.value, 0);
        datachan.datachan_send_async_command(device.device, 0x02, buf, buf.length);
        break;
      case "set_heater_state":
        buf = new Buffer([parseInt(command.value * 255)]);
        datachan.datachan_send_async_command(device.device, 0x04, buf, buf.length);
        break;
      case "set_gain":
        buf = new Buffer([parseInt(command.channel), parseInt(command.value)]);
        datachan.datachan_send_async_command(device.device, 0x05, buf, buf.length);
        break;
    }
  }
}

function read() {

  var scope = {
    'time': 0,
    'ch1': 0,
    'ch2': 0,
    'ch3': 0,
    'ch4': 0,
    'ch5': 0,
    'ch6': 0,
    'ch7': 0,
    'ch8': 0
  };

  var measure = new Buffer(52);

  if (datachan.datachan_device_is_enabled(device.device)) {
    meas_index = datachan.datachan_device_enqueued_measures(device.device);

    if (meas_index === 0) {
      //dispatch_error('No measure available to read', e)
      return;
    }

    while (meas_index > 0 || meas_index < 0) {
      try {
        mes = datachan.datachan_device_dequeue_measure(device.device);
        mes.type = measure_t;
        measure = ref.deref(mes);
        if (meas_index === 1) { //only load the first measure, de-facto limiting the sample rate by dequeing old measures
          scope.time = measure.time * 1000 + measure.millis;
          for (i = 0; i < measure.measureNum; i++) {
            scope['ch' + measure.channels[i]] = measure.values[i];
          }
        }
        datachan.datachan_clean_measure(mes);
        meas_index--;
      } catch (e) {
        dispatch_error('Error reading measure', e)
        return;
      }
    }
  }

  process.send({
    action: 'mes',
    message: scope
  });
}


process.on('message', (data) => {
  switch (data.action) {

    case 'on':
      process.send({
        action: 'on',
        message: on(data.message.vid, data.message.pid)
      });
      break;

    case 'off':
      off();
      break;

    case 'ison':
      process.send({
        action: 'ison',
        message: ison()
      });
      break;

    case 'send_command':
      send_command(data.message);
      break;
  }
});
