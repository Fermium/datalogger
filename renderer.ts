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
const codemirror = require('codemirror');
var scope =  {
  'k' : 0
};
var timer = new easytimer();
var tex = {}
var equations = 'temp=ch5 K\nvh1=ch3 V\nvh2=ch4 V\nvh=(vh1-vh1*k+vh2*k)\nvr=ch2 V\nI=ch1 A\nr=vr/(I/100)\nB=ch6 T'
var nodes = []
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
$('[data-action="handbook"]').click(function() {
  ipcRenderer.send('handbook');
})
$('[data-action="editequation"]').click(function() {
    /*bootbox.prompt({
        size: 'medium',
        inputType: 'textarea',
        value: equations,
        title: 'Insert the new equation for the cell',
        callback: function(result) {
          var run = ipcRenderer.sendSync('isrunning');
          if(run){
            if(result != null) equations=result;
            math.eval(equations,scope);
            evaluate();
          }
          updateTex();

        }
    });*/
    var modal=bootbox.dialog({
      message : '<div class="col-md-6 col-sm-6 col-xs-6"><textarea class="form-control"  id="equations"></textarea></div><div id="latex" class="col-md-6 col-sm-6 col-xs-6"></div>',
      title : 'Experiment equations',
      buttons : {
        danger : {
          label : 'Cancel',
          className : 'btn-default',
          callback : function(){
          }

        },
        success : {
          label:'Confirm',
          className: 'btn-primary',
          callback: function() {
            console.log('ok')
            result = $('#equations').val();
            var run = ipcRenderer.sendSync('isrunning');
            if(result != null) equations=result;
            if(run){
              math.eval(equations,scope);
              evaluate();
            }
            updateTex();

          }
        }

      },
      show : false,
      onEscape : true

    });
    modal.on('show.bs.modal',function(){
      /*var editor = codemirror.fromTextArea(document.getElementById('equations'),{
        lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true
  })*/
      eq = $('#equations')
      mm = equations.split('\n');
      $('#latex').html('');
      for(i in mm){
        $('#latex').append('$$'+math.parse(mm[i]).toTex()+'$$<br/>');
      }
      mathjaxHelper.loadAndTypeset(document, document.getElementById('latex'));
      eq.on('change paste', function() {
          mm = eq.val().split('\n');
          $('#latex').html('');
          $('#latex').css('maxHeight',eq.height());

          for(i in mm){
            try{
              a  = math.parse(mm[i]).toTex();
            }
            catch(err){

            }
            if(!(a===undefined)){
              $('#latex').append('$$'+a+'$$<br/>');
            }
          }

            mathjaxHelper.loadAndTypeset(document, document.getElementById('latex'));


      });

    });
    modal.on('shown.bs.modal',function(){
      eq = $('#equations');
      eq.css('maxWidth',eq.parent().width());
      eq.css('height',$('#latex').height());

      eq.val(equations);
    })
    modal.modal('show');
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
  running = ipcRenderer.sendSync('isrunning');
  nodes.forEach(function(n){
    var nn=n.split('=');
    tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
    if(running){
      var popover=$('#'+nn[0].trim()).data('bs.popover');
      $('#'+nn[0].trim()).attr('data-content','$$' + tex[nn[0].trim()].trim() + '$$');
      popover.setContent();
      popover.$tip.addClass(popover.options.placement);
    }
  });


}
