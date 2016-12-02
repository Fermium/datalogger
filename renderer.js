var app = require('electron').remote;
var dialog = app.dialog;
var config = app.getGlobal('config');
var scope = app.getGlobal('scope');
var handler = require('./usb-handler');
var slider = require('bootstrap-slider');
var math = require('mathjs');
var mathjaxHelper = require('mathjax-electron');
var equations = {
//'name'   : 'value',
	'temp'   : 'ch5',
	'vh1'    : 'ch3',
	'vh2'    : 'ch4',
	'vh'     : '(ch3-ch3*k+ch4*k)',
	'r-mes'  : 'ch2',
	'r-cal'  : 'ch2/(ch1/100)',
	'I'      : 'ch1',
	'B'      : 'ch6',

}
var unit = {
	'temp' : 'kelvin',
}
var base_unit = {
	'temp' : 'kelvin'
}
var nodes = {}
$(function() {
	$("[name='start-stop']").bootstrapSwitch({
    onText : 'REC',
    offText : '<i class="icon-pause2"></i>',
    onSwitchChange: (event,state) => {
      if(state){
        if(!handler.start()){
					$("[name='start-stop']").bootstrapSwitch('state',false);
				}
				else{
					new PNotify({
						title: 'Recording Started',
						text : '',
						icon : false,
						type : 'info',
						styling : 'bootstrap3',
					  addclass: 'translucent',
						animate_speed	: 'fast'
					});
				}
      }
      else{
        handler.stop();
				new PNotify({
					title: 'Recording Stopped',
					text : '',
					icon : false,
					type : 'info',
					styling : 'bootstrap3',
					addclass: 'translucent',
					animate_speed	: 'fast'
				});
				clearInterval(eval);
      }
    }
	});
	$("[name='on-off']").bootstrapSwitch({
    onText : 'ON',
    offText : 'OFF',
    onSwitchChange: (event,state) => {
      if(state){
				handler.on();
				bootbox.prompt({
				    size: 'small',
						inputType: 'text',
				    title: 'Input the experiment name or skip for default value',
				    callback: function(result){
							text = (result==null || result.trim()=='') ? config._experiment : result;
							config._experiment = text
							$('#experiment').text(text);
							$('#date').text(' - '+config._date);
						}
				});
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
      }
      else{
				handler.off();
				$("[name='start-stop']").bootstrapSwitch('state',false);
				$("[name='start-stop']").bootstrapSwitch('toggleDisabled');
				$('#experiment').text('');
				$('#date').text('');

    }
	}
	});
});

$('#tempselect').change(function(){
	unit['temp'] = $('#tempselect').val();
	nodes['temp'] = math.parse('('+equations['temp']+')'+ base_unit['temp'] +((unit['temp']!=base_unit['temp'])?' to '+unit['temp']:''));
	$('#temp').data('bs.popover').options.content = '$$'+nodes['temp'].toTex()+'$$';

})

$('#plot').click(function(){
    window.open('./plot/index.html')
});
$('.gain li a').click(function(){
  var selText = $(this).text();
  $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText+' <i class="caret"></i>');
});

$('#power').ionRangeSlider({
	min:0,
	max:100,
	prefix : 'Power: ',
	postfix : '%'
});

$('#k-slider').ionRangeSlider({
	min:0,
	max:1,
	step:0.001,
	prefix : 'K: ',
	keyboard : true,
	onChange: function(data){
		scope.k = data.from;
		$('#k-value').val(data.from);
	},
	onStart: function(data){
		scope.k = data.from;
		$('#k-value').val(data.from);
	}
});

$('#k-value').keyup(function(){
	val = $('#k-value').val();
	if(val>1){
		val=1;
		$('#k-value').val(val);
	}
	if(val<0){
		val=0;
		$('#k-value').val(val);
	}
	scope.k = val;
	$("#k-slider").data("ionRangeSlider").update({
		from : val
	});

});
for (var key in equations){

	if (!equations.hasOwnProperty(key)) continue;
	if(!nodes.hasOwnProperty(key)){
		nodes[key]=math.parse(equations[key]);
	}
	$('#'+key).popover({
		 trigger: 'hover',
		 title : 'Formula',
		 html : true,
		 content: '<div id="'+key+'_formula">$$'+nodes[key].toTex()+'$$</div>'
	 	}).on('shown.bs.popover',function(){
		mathjaxHelper.loadAndTypeset(document, document.getElementById(key+'_formula'));
	});
}

$('[data-action="editequation"]').click(function(){
	id = $(this).attr('data-content');
	bootbox.prompt({
			size: 'medium',
			inputType: 'text',
			value : equations[id],
			title: 'Insert the new equation for the cell',
			callback: function(result){
				equations[id]=(result!=null)?result:equations[id];
				nodes[id] = math.parse('('+equations[id]+') '+((base_unit.hasOwnProperty(id))?base_unit[id]:'')+((unit.hasOwnProperty(id) && unit[id]!=base_unit['id'])?' to '+unit[id]:''));
			  $('#'+id).data('bs.popover').options.content = '$$'+nodes[id].toTex()+'$$';
				evaluate();
		  }
	});
});

function evaluate(){
for (var key in nodes){
	$('#'+key).text((((nodes[key].eval(scope)),2).toString()).split(' ')[0]);
}
}
eval=setInterval(evaluate,500);
