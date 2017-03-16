var _ = require('lodash');
var app = require('electron').remote;
var dialog = app.dialog;
var session = app.getGlobal('session');
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
var mathsheet;
var gains;
var nodes = [];
mathjaxHelper.loadMathJax(document);
$(document).ready(function(){
  var tmp=ipcRenderer.sendSync('ready');
  console.log(tmp)
  gains = tmp.config.gains;
  mathsheet = tmp.config.mathsheet.trim();
  nodes = mathsheet.split('\n');
  console.log(nodes);
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
          mathjaxHelper.typesetMath(document.getElementById(key + '_formula'));
      });

  }
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
                      value : session._name,
                      title: 'Input the experiment name or skip for default value',
                      callback: function(result) {
                          console.log(result);
                          if(result == null ){
                            $("[name='on-off']").bootstrapSwitch('state',false);
                            return;
                          }
                          text = result.trim() == '' ? session._name : result;
                          session._name = text;
                          $('#experiment').text(text);
                          $('#date').text(' - ' + session._date);
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
})

ipcRenderer.on('measure',function(event,args){
  _.extend(scope,args.scope);
  math.format(math.eval(mathsheet,scope),2);
  evaluate();
  ipcRenderer.send('update',{'scope':scope});
});
$('#tempselect').change(function() {
    $('#temp').data('unit', $('#tempselect').val());
    mathsheet+='\ntemp=temp to '+$('#temp').data('unit');
    math.format(math.eval(mathsheet,scope),2);
    updateTex();

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
});
$('[data-action="inputs"]').click(function(){
  var modal=bootbox.dialog({
    message : '<div id="inputs-content"</div>',
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
          //send shit
        }
      }

    },
    show : false,
    onEscape : true

  });
  modal.on('show.bs.modal',function(){
    for(i=0;i<gains.length;i++){
      $('#inputs-content').append($('<div/>').addClass('row').append('<div class="col-md-3 col-sm-3 col-xs-3">'+gains[i].name+'</div><div class="col-md-3 col-sm-3 col-xs-3"><select class="gain"></select></div><div class="col-md-6 col-sm-6 col-xs-6">'+gains[i].description+'</div>'));
    }

    $('.gain').each(function(i){
       $(this).selectBoxIt({
         autoWidth: false,
         copyClasses : "container"
       });
       gains[i].gainvalues.forEach((el)=>{
          $(this).data("selectBox-selectBoxIt").add({value: el,text : 'x'+el});
       });
       $(this).find('option[value='+gains[i].gain+']').attr('selected','selected');
       $(this).data('selectBox-selectBoxIt').refresh();
    });

  });
  modal.modal('show');
});
$('[data-action="editequation"]').click(function() {
    var editor;
    var modal=bootbox.dialog({
      message : '<div class="row d-flex flex-column" style="position:relative"><div class="col-md-6 col-sm-6 col-xs-6"><textarea class="form-control"  id="equations"></textarea></div><ul id="latex" class="col-md-6 col-sm-6 col-xs-6" style="overflow:hidden; overflow-y:scroll;"></ul></div>',
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
            result = editor.getValue();
            var run = ipcRenderer.sendSync('isrunning');
            if(result != null) mathsheet=result;
            if(run){
              math.eval(mathsheet,scope);
              evaluate();
            }
            updateTex();

          }
        }

      },
      show : false,
      onEscape : true

    });
    modal.on('shown.bs.modal',function(){
      editor = codemirror.fromTextArea(document.getElementById('equations'),{
        mode: 'javascript',
        theme : 'default',
        lineNumbers: true,
        matchBrackets: true,

      });
      eq = $('#equations')
      editor.setValue(mathsheet);
      mm = editor.getValue().split('\n');
      $('#latex').html('');
      $('#latex').css('maxHeight',editor.getWrapperElement().offsetHeight);

      for(i in mm){
        try{
          a  = math.parse(mm[i]).toTex();
        }
        catch(err){

        }
        if(!(a===undefined)){
          $('#latex').append('<li class="list-group-item">$'+a+'$</li>');
        }
      }
      mathjaxHelper.typesetMath(document.getElementById('latex'));
      editor.on('change',function(cm,chs){
        mm = editor.getValue().split('\n');
        len = $('#latex').find('li').length;
        i=0;
        for(i;i < len ;i++){
          if(i<mm.length){

            a  = math.parse(mm[i]).toTex().trim();
            a = a=='undefined' ? '' : a;
            if($('#latex').find('li').eq(i).text().trim()!=a){
              if(a!='' && a!=undefined){
                $('#latex').find('li').eq(i).text('$'+a+'$');
                mathjaxHelper.typesetMath($('#latex').find('li').eq(i).get(0));
              }
              else{
                $('#latex').find('li').eq(i).remove();
              }
            }
          }
          if(i>=mm.length){
            $('#latex').find('li').eq(i).remove();
          }
        }
        for(i;i<mm.length;i++){
            a  = math.parse(mm[i]).toTex().trim();
            a = a=='undefined' ? '' : '$'+a+'$';
            if(a!='$$'){
              $('#latex').append('<li class="list-group-item">'+a+'</li>');
              mathjaxHelper.typesetMath($('#latex').find('li').eq(i).get(0));
            }
        }
      });
    });
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
  nodes = mathsheet.split('\n');
  running = ipcRenderer.sendSync('isrunning');
  nodes.forEach(function(n){

    if(n.indexOf('#')==-1 && n.indexOf('=')!==-1){
      var nn=n.split('=');
      tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
      if(running){
        var popover=$('#'+nn[0].trim()).data('bs.popover');
        $('#'+nn[0].trim()).attr('data-content','$$' + tex[nn[0].trim()].trim() + '$$');
        popover.setContent();
        popover.$tip.addClass(popover.options.placement);
      }
    }
  });
}
$('[data-action="plot"]').click(function(){
  var name=$(this).data('name');
  ipcRenderer.send('plot',{'name':name});
});
