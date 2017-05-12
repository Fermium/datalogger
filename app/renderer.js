/*  NodeJS Requires  */

const _ = require('lodash');
const math = require('mathjs');
const mathjaxHelper = require('mathjax-electron');
const easytimer = require('easytimer');
const codemirror = require('codemirror');
const db = require('./logger');
/* End NodeJS Requires */

/* Electron requires */

const app = require('electron').remote;
const {ipcRenderer} = require('electron');
var dialog = app.dialog;
var session = app.getGlobal('session');

/* End Electron requires */

/* Variables */

var scope = {};
var timer = new easytimer();
var tex = {};
var mathsheet = {};
var channels = {};

/* End Variables */

/**************************************************/
$(document).ready(function(){
  init();
  $("[name='start-stop']").bootstrapSwitch({
      onText: 'REC',
      offText: '<i class="icon-pause2"></i>',
      onSwitchChange: (event, state) => {
        if (state) {
          rec();
        } else {
          pause();
        }
      }
  });
  $("[name='on-off']").bootstrapSwitch({
    onText: 'ON',
    offText: 'OFF',
    onSwitchChange: (event, state) => {
      if (state) {
        on();
      } else {
        off();
      }
    }
  });
});

/* Events */
ipcRenderer.on('usb-fail',function(event,args){
  $("[name='on-off']").bootstrapSwitch('state', false);
});

ipcRenderer.on('measure',function(event,args){
  _.extend(scope,args.scope);
  math.format(math.eval(mathsheet,scope),2);
  evaluate();
  check_temp();
  ipcRenderer.send('update',{'scope':scope});
});

//TODO: Rifare
$('#tempselect').change(function() {
  $('#temp').data('unit', $('#tempselect').val());
  mathsheet+='\ntemp=temp to '+$('#temp').data('unit');
  math.format(math.eval(mathsheet,scope),2);
  updateTex();
});

$('[data-action="handbook"]').click(function() {
  ipcRenderer.send('handbook');
});

$('[data-action="save-file"]').click(function(){
  var diag=dialog.showSaveDialog({ defaultPath : require('os').homedir()+'/.datalogger/sessions/'+session._name+"_"+session._date,title: 'Experiment file save location'});
  ipcRenderer.send('save-file',{path : diag});
  if($("[name='start-stop']").prop("disabled") && $("[name='on-off']").bootstrapSwitch('state')){
    $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
  }

});
$('[data-action="plot"]').click(function(){
  var name=$(this).data('plot');
  ipcRenderer.send('plot',{'name':name});
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
          $('select.gain').each(function(i){
            channels[i].gain = $(this).val();
            ipcRenderer.send('send-to-hardware',{id:'set_gain',channel: channels[i].code,value:channels[i].gain});
          });
        }
      }
    },
    show : false,
    onEscape : true
  });
  modal.on('show.bs.modal',function(){
    var i;
    for(i=0;i<channels.length;i++){
      $('#inputs-content').append($('<div/>').addClass('row').append(
        '<div class="col-md-3 col-sm-3 col-xs-3">'+
        channels[i].name+
        '</div><div class="col-md-3 col-sm-3 col-xs-3">'+
        '<select class="gain"></select></div><div class="col-md-6 col-sm-6 col-xs-6">'+
        channels[i].description+
        '</div>'));
    }
    $('.gain').each(function(i){
      $(this).selectBoxIt({
        autoWidth: false,
        copyClasses : "container",
      });
      channels[i].gainvalues.forEach((el)=>{
        $(this).data("selectBox-selectBoxIt").add({value: el,text : 'x'+el});
      });
      $(this).find('option[value='+channels[i].gain+']').attr('selected','selected');
      $(this).data('selectBox-selectBoxIt').refresh();
    });
  });
  modal.modal('show');
});

$('[data-action="editequation"]').click(function() {
  var editor;
  var modal=bootbox.dialog({
    message : ''+
    '<div class="row d-flex flex-column" style="position:relative">'+
      '<div class="col-md-6 col-sm-6 col-xs-6">'+
        '<textarea class="form-control"  id="equations"></textarea>'+
      '</div>'+
      '<ul id="latex" class="col-md-6 col-sm-6 col-xs-6" style="overflow:hidden; overflow-y:scroll;">'+
      '</ul>'+
    '</div>',
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
          if(run){
            try{
              if(result !== null) mathsheet=result;
              math.eval(mathsheet,scope);
              evaluate();
            }
            catch(err){
              dialog.showMessageBox({type: 'error',title: 'Error in math', message : err.toString()})
            }

          }
          updateTex();
          ui.blocks.forEach(updatePopover);
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
    eq = $('#equations');
    editor.setValue(mathsheet);
    var mm = editor.getValue().split('\n');
    $('#latex').html('');
    $('#latex').css('maxHeight',editor.getWrapperElement().offsetHeight);
    for(var i in mm){
      try{
        var a  = math.parse(mm[i]).toTex();
        if(a!==undefined){
          $('#latex').append('<li class="list-group-item">$'+a+'$</li>');
        }
      }
      catch(err){
        dialog.showMessageBox({type: 'error',title: 'Error in math', message : err.toString()})
      }
    }
    mathjaxHelper.typesetMath(document.getElementById('latex'));
    editor.on('change',function(cm,chs){
      var mm = editor.getValue().split('\n');
      var len = $('#latex').find('li').length;
      var i=0;
      var a;
      for(i;i < len ;i++){
        if(i<mm.length){
            a  = math.parse(mm[i]).toTex().trim();
            a = a=='undefined' ? '' : a;
            if($('#latex').find('li').eq(i).text().trim()!=a){
              if(a!=='' && a!==undefined){
                $('#latex').find('li').eq(i).text('$'+a+'$');
                mathjaxHelper.typesetMath($('#latex').find('li').eq(i).get(0));
              }
              else{
                $('#latex').find('li').eq(i).remove();
              }
            }
          if(i>=mm.length){
            $('#latex').find('li').eq(i).remove();
          }
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


/* End Events */

function init(){
  mathjaxHelper.loadMathJax(document);
  var tmp=ipcRenderer.sendSync('ready');
  channels = tmp.config.channels;
  mathsheet = tmp.config.mathsheet.trim();
  var inputs = tmp.config.inputs;
  inputs.forEach(function(input){
    if(!input.sendtohardware){
      scope[input.name]=input.default;
    }
    else{
      ipcRenderer.send('send-to-hardware',{name:input.name,value:input.default});
    }
  });
  ui.init(inputs);
  ui.handler.on('input-change',inputhandler);
  updateTex();
  ui.blocks.forEach(initpopover);
}





function inputhandler(data){
  if(data.hardware){
    ipcRenderer.send('send-to-hardware',{id:data.id,value:data.value});
  }
  else{
    scope[data.id]=data.value;
  }
}


function updateTex(){
  var nodes = mathsheet.split('\n');
  nodes.forEach(function(n){
    if(n.indexOf('=')!==-1){
      var nn=n.split('=');
      tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
    }
  });
}
function evaluate() {
  for (var block in ui.blocks) {
    var bb = ui.blocks[block];
    try {
      $('[data-measure*='+ bb.val+']').text(math.format(scope[bb.val],{notation:bb.format,precision:bb.sig}));
    } catch (err) {
      console.log(err);
      if (err.toString().indexOf('Undefined symbol') != -1) {
        $('[data-measure=' + bb.val+']').text('Reading...');
      } else {
        console.log(err.toString());
      }
    }
  }
}

/* Popovers */
function initpopover(block){
  {
    $('[data-measure*="'+block.val+'"]').popover({
      trigger: 'hover',
      title: 'Formula',
      html: true,
      placement: 'bottom',
      content: '<div id="' + block.val + '_formula">$$' + tex[block.val] + '$$</div>'
    }).on('shown.bs.popover', function() {
      mathjaxHelper.typesetMath(document.getElementById(block.val + '_formula'));
    });
  }
}


function updatePopover(block){
  running = ipcRenderer.sendSync('isrunning');
  var popover=$('[data-measure*="'+block.val+'"]').attr('data-content','$$' + tex[block.val].trim() + '$$').data('bs.popover');
  popover.setContent();
  popover.$tip.addClass(popover.options.placement);
}
/********************/



/* Machine controls */

function on(){
  if(ipcRenderer.sendSync('on')){
    bootbox.prompt({
      size: 'small',
      inputType: 'text',
      value : session._name,
      title: 'Input the experiment name or skip for default value',
      callback: function(result) {
        if(result === null ){
          $("[name='on-off']").bootstrapSwitch('state',false);
          return;
        }
        var text = result.trim() === '' ? session._name : result;
        session._name = text;
        $('#session').text(text);
        $('#date').text(' - ' + session._date);
        if(db.existsdb() && $("[name='start-stop']").prop("disabled")){
          $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
        }
      }
    });
  }
  else {
    $("[name='on-off']").bootstrapSwitch('state',false);
    bootbox.confirm({
      size: 'small',
      title : 'Usb Error',
      message: 'Usb device disconnected, please reconnect and then click ok',
      callback: function(result){
        if(result){
          $("[name='on-off']").bootstrapSwitch('state',true);
        }
      }
    });
  }
}

function off(){
  timer.stop();
  $('#timer').html('00:00:00');
  $("[name='start-stop']").bootstrapSwitch('state', false);
  $("[name='start-stop']").bootstrapSwitch('disabled',true);
  $('#experiment').text('');
  $('#date').text('');
  ui.init();
  ipcRenderer.send('off');
}

function rec(){
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
}

function pause(){
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
}
function check_temp(){
  if(math.eval('abs(temp)>=65 degC',scope)){
    $('.icon-fire').addClass('hot');
    $('.icon-fire').attr({'title': 'Not safe to touch'})
  }
  else{
    $('.icon-fire').removeClass('hot');
    $('.icon-fire').attr({'title': 'Safe to touch'})
  }
}

/*****************************/
