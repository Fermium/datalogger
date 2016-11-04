var dateFormat = require('dateformat'); //for date
var low = require('lowdb'); //real time .json writing
var _ = require('lodash');
var fs = require('fs');
var remote = require('electron').remote;
var filename = 'test.json' //development thing
var file = remote.getGlobal('config')._file = './data/'+dateFormat(Date.now(), "yyyy_mm_dd_")+filename;//development thing
var reading = {'series': null,'timestamp': 0, 'value': 0};

const db = low(file);
db.defaults({ _data : [] , _experiment : '', _date : ''}).value();
db.set('_experiment','test').value();
db.set('_date',dateFormat(Date.now(), "yyyy mm dd")).value();
$('#records').find('thead')
  .append($('<tr>')
    .append($('<th>')
      .text('timestamp'))
    .append($('<th>')
      .text('value'))
  );
var i=0;
setInterval(function(){

/*fake reading*/
reading.series = 'test';
reading.timestamp = i++;
reading.value = Math.random();
////////////////////////////////

db.get('_data').push({'series': reading.series , 'timestamp': reading.timestamp, 'value': reading.value}).value();
$('#records').find('tbody')
  .append($('<tr>')
    .append($('<td>')
      .text(reading.timestamp))
    .append($('<td>')
      .text(reading.value))
  );

},500);

$('#plot').click(function(){
    //ipcRenderer.send('plot',file);
    window.open('./plot.html')
})
