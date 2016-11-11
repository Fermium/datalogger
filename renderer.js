var app = require('electron').remote;
var dialog = app.dialog;
var config = app.getGlobal('config');
var handler = require('./usb-handler');
var slider = require('bootstrap-slider');

var mathjaxHelper = require('mathjax-electron')

var container = document.getElementById('vh');
container.innerHTML = '$$\\sum\\limits_{i=0}^{\\infty} \\frac{1}{n^2}$$';

mathjaxHelper.loadAndTypeset(document, container);






$(function() {
	$("[name='start-stop']").bootstrapSwitch({
    onText : 'REC',
    offText : '<i class="icon-pause2"></i>',
    onSwitchChange: (event,state) => {
      if(state){
        handler.start();
      }
      else{
        handler.stop();
      }
    }
	});
	$("[name='on-off']").bootstrapSwitch({
    onText : 'ON',
    offText : 'OFF',
    onSwitchChange: (event,state) => {
      if(state){
				handler.on();
				$('#experiment').text(config._experiment);
				$('#date').text(' - '+config._date);
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
      }
      else{
				handler.off();
				$("[name='start-stop']").bootstrapSwitch('toggleState');
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
      }
    }
	});
});



$('#plot').click(function(){
    window.open('./plot/index.html')
})
$(".gain li a").click(function(){
  var selText = $(this).text();
  $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText+' <i class="caret"></i>');
});
/*
$('#experiment').keydown(function(e) {
     if(e.keyCode == 13) {
       e.preventDefault(); // Makes no difference
			 $(this).blur(function() {
         $(this).attr('contentEditable', false);
			 });
   }
});

$('#experiment').bind('dblclick', function() {
        $(this).attr('contentEditable', true);
    }).blur(
        function() {
            $(this).attr('contentEditable', false);
});
*/
