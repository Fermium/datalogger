

var app = require('electron').remote;
var dialog = app.dialog;
var dateFormat = require('dateformat'); //for date
var low = require('lowdb'); //real time .json writing
var _ = require('lodash');
var remote = require('electron').remote;
var db;
var reading = {'series': null,'timestamp': 0, 'value': 0};
var config = remote.getGlobal('config');
var i=0;
var starting;
// Initialize plugin

$(function() {
	$("[name='start-stop']").bootstrapSwitch({
    onText : '<i class="icon-play4"></i>',
    offText : '<i class="icon-stop2"></i>',
    onSwitchChange: (event,state) => {
      if(state){
        saveFile();
      }
      else{
        clearInterval(starting);
      }
    }
	});
});




////////////////////////////////////////////////////////////////////////
/***************************** INIT **********************************/
//////////////////////////////////////////////////////////////////////
/*const db = low(config._file);*/

$('#records').find('thead')
  .append($('<tr>')
    .append($('<th>')
      .text('timestamp'))
    .append($('<th>')
      .text('value'))
  );
/////////////////////////////////////////////////////////////////////

function read(){

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

}

$('#plot').click(function(){
    //ipcRenderer.send('plot',file);
    window.open('./plot.html')
})


function saveFile(){
  if(!config._source){
  dialog.showSaveDialog({ defaultPath : './data'},function (fileName) {
         if (fileName === undefined){
              console.log("You didn't save the file");
              return;
         }
		 		 fileName = (fileName.endsWith('.json')) ? fileName : fileName+'.json' ;
				 config._file=fileName;
				 db = low(fileName);
				 db.defaults({ _data : [] , _experiment : '', _date : ''}).value();
				 db.set('_experiment','test').value();
				 db.set('_date',dateFormat(Date.now(), "yyyy mm dd")).value();
				 config._source = true;
				 starting=setInterval(read,500);
  });
  }
	else{
		starting=setInterval(read,500);
	}
}
