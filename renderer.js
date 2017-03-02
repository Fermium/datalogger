var _ = require('lodash');
var app = require('electron').remote;
var dialog = app.dialog;
var config = app.getGlobal('config');
var scope = app.getGlobal('scope');
var slider = require('bootstrap-slider');
var math = require('mathjs');
var mathjaxHelper = require('mathjax-electron');
var formula = app.getGlobal('formula');
var easytimer = require('easytimer');
const {ipcRenderer} = require('electron');
var scope =  {
  'k' : 0
};
var timer = new easytimer();
var equations = 'temp=ch5\nvh1=ch3\nvh2=ch4\nvh=(vh1-vh1*k+vh2*k)\nvr=ch2\nI=ch1\nr=vr/(I^2/100)\nB=ch6'

var tex = {}
$(function() {
    $("[name='start-stop']").bootstrapSwitch({
        onText: 'REC',
        offText: '<i class="icon-pause2"></i>',
        onSwitchChange: (event, state) => {
            if (state) {
              $.blockUI();
              ipcRenderer.send('start');
              ipcRenderer.on('started',function(event,args){
                console.log(args.return);
                if(!args.return){
                    $("[name='start-stop']").bootstrapSwitch('state', false);
                } else {
                    new PNotify({
                        title: 'Recording Started',
                        text: '',
                        icon: false,
                        type: 'info',
                        styling: 'bootstrap3',
                        addclass: 'translucent',
                        animate_speed: 'fast'
                    });
                }
              });
                timer.start();
                timer.addEventListener('secondsUpdated', function(e) {
                    $('#timer').html(timer.getTimeValues().toString());
                });
                eval = setInterval(evaluate, 500);
                $.unblockUI();
            } else {
                ipcRenderer.send('stop');
                timer.pause();
                new PNotify({
                    title: 'Recording Stopped',
                    text: '',
                    icon: false,
                    type: 'info',
                    styling: 'bootstrap3',
                    addclass: 'translucent',
                    animate_speed: 'fast'
                });
                //_.merge(formula,equations);
                clearInterval(eval);
            }
        }
    });
    $("[name='on-off']").bootstrapSwitch({
        onText: 'ON',
        offText: 'OFF',
        onSwitchChange: (event, state) => {
            if (state) {
                ipcRenderer.send('on');
                bootbox.prompt({
                    size: 'small',
                    inputType: 'text',
                    title: 'Input the experiment name or skip for default value',
                    callback: function(result) {
                        text = (result == null || result.trim() == '') ? config._experiment : result;
                        config._experiment = text;
                        $('#experiment').text(text);
                        $('#date').text(' - ' + config._date);
                    }
                });
                $("[name='start-stop']").bootstrapSwitch('toggleDisabled');

            } else {
                ipcRenderer.send('off');
                timer.stop();
                $('#timer').html('00:00:00');
                $("[name='start-stop']").bootstrapSwitch('state', false);
                $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
                $('#experiment').text('');
                $('#date').text('');
                clearInterval(eval);

            }
        }
    });
});
ipcRenderer.on('measure',function(event,args){
  _.extend(scope,args.scope);
  ipcRenderer.send('update',{'scope':scope});
});
$('#tempselect').change(function() {
    $('#temp').data('unit', $('#tempselect').val());
    /*nodes['temp'] = math.parse(equations['temp'] );*/
    /*$('#temp').data('bs.popover').options.content = '$$' + nodes['temp'].toTex() + '$$';*/

});

$('#plot').click(function() {
  ipcRenderer.send('plot');
});
$('.gain li a').click(function() {
    var selText = $(this).text();
    $(this).parents('.gain-wrap').find('.dropdown-toggle').html(selText + ' <i class="caret"></i>');
});

$('#power').ionRangeSlider({
    min: 0,
    max: 100,
    prefix: 'Power: ',
    postfix: '%'
});

$('#k-slider').ionRangeSlider({
    min: 0,
    max: 1,
    step: 0.001,
    prefix: 'K: ',
    keyboard: true,
    onChange: function(data) {
        scope.k = data.from;
        $('#k-value').val(data.from);
    },
    onStart: function(data) {
        scope.k = data.from;
        $('#k-value').val(data.from);
    }
});

$('#k-value').keyup(function() {
    val = $('#k-value').val();
    if (val > 1) {
        val = 1;
        $('#k-value').val(val);
    }
    if (val < 0) {
        val = 0;
        $('#k-value').val(val);
    }
    scope.k = val;
    $("#k-slider").data("ionRangeSlider").update({
        from: val
    });

});
/*for (var key in equations) {

    if (!equations.hasOwnProperty(key)) continue;
    if (!nodes.hasOwnProperty(key)) {
        nodes[key] = math.parse(equations[key]);
    }
    $('#' + key).popover({
        trigger: 'hover',
        title: 'Formula',
        html: true,
        content: '<div id="' + key + '_formula">$$' + nodes[key].toTex() + '$$</div>'
    }).on('shown.bs.popover', function() {
        mathjaxHelper.loadAndTypeset(document, document.getElementById(key + '_formula'));
    });
}*/

$('[data-action="editequation"]').click(function() {
    bootbox.prompt({
        size: 'medium',
        inputType: 'textarea',
        value: equations,
        title: 'Insert the new equation for the cell',
        callback: function(result) {
          if(result != null) equations=result;
          nodes = equations.split('\n');
          for(i=0;i<nodes.length;i++){
            nn=nodes[i].split('=');
            tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
          }
          math.eval(equations,scope);
          console.log(scope);
          console.log(tex);
        }
    });
});

function evaluate() {
    for (var key in tex) {
        try {
            //$('#' + key).text(math.eval('(' + math.round(parseFloat(nodes[key].eval(scope).toString()), 2) + ')' + (($('#' + key).data('baseunit')) + (($('#' + key).data('unit') != $('#' + key).data('baseunit')) ? ' to ' + $('#' + key).data('unit') : ''))).toString());
        } catch (err) {
            if (err.toString().indexOf('Undefined symbol') != -1) {
                $('#' + key).text('Reading...');
            } else {
                console.log(err.toString());

            }
        }
    }
}
