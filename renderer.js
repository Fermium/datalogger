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
var tex = {}
var equations = 'temp=ch5 K\nvh1=ch3 V\nvh2=ch4 V\nvh=(vh1-vh1*k+vh2*k)\nvr=ch2 V\nI=ch1 A\nr=vr/(I/100)\nB=ch6 T'
var nodes = []
updateTex();

$(function() {
    $("[name='start-stop']").bootstrapSwitch({
        onText: 'REC',
        offText: '<i class="icon-pause2"></i>',
        onSwitchChange: (event, state) => {
            if (state) {
              $.blockUI();
              ipcRenderer.send('start');
              ipcRenderer.on('started',function(event,args){
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

            }
        }
    });
});
ipcRenderer.on('measure',function(event,args){
  _.extend(scope,args.scope);
  math.format(math.eval(equations,scope),2);
  evaluate();
  ipcRenderer.send('update',{'scope':scope});
});
$('#tempselect').change(function() {
    $('#temp').data('unit', $('#tempselect').val());
    equations+='\ntemp=temp to '+$('#temp').data('unit');
    math.format(math.eval(equations,scope),2);
    nodes = equations.split('\n');
    nodes.forEach(function(n){
      var nn=n.split('=');
      tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
    });
    updateTex();

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

$('[data-action="editequation"]').click(function() {
    bootbox.prompt({
        size: 'medium',
        inputType: 'textarea',
        value: equations,
        title: 'Insert the new equation for the cell',
        callback: function(result) {
          var run = ipcRenderer.sendSync('isrunning');
          console.log(run);
          if(run){
            if(result != null) equations=result;
            updateTex();
            math.eval(equations,scope);

          }
        }
    });
});

function evaluate() {
    for (var key in tex) {
        try {
            $('#' + key).text(math.format(scope[key],{precision:5}));
        } catch (err) {
            if (err.toString().indexOf('Undefined symbol') != -1) {
                $('#' + key).text('Reading...');
            } else {
                console.log(err.toString());

            }
        }
    }
}
function updateTex(){
  nodes = equations.split('\n');
  nodes.forEach(function(n){
    var nn=n.split('=');
    tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
  });
  for (var key in tex) {
      $('#' + key).popover({
          trigger: 'hover',
          title: 'Formula',
          html: true,
          placement: 'bottom',
          content: '<div id="' + key + '_formula">$$' + tex[key] + '$$</div>'
      }).on('shown.bs.popover', function() {
          mathjaxHelper.loadAndTypeset(document, document.getElementById(key + '_formula'));
      });
  }
}
