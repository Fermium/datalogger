/*  NodeJS Requires  */
/*jshint esversion: 6*/
var path = require('path');
const _ = require('lodash');
const math = require('mathjs');
const mathjaxHelper = require('mathjax-electron');
const easytimer = require('easytimer');
const codemirror = require('codemirror');
var fs = require('fs');
var pjson = require(path.normalize(path.join('..','..','package.json')));
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
var recording;

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
var mathsheet = "";
var channels = {};
var unit = {};

var modal;
/* End Variables */

/**************************************************/
$(document).ready(function(){
  app.getCurrentWindow().toggleDevTools();
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
  var values={};
  ui.blocks.forEach(function(x){
    try{
    values[x.val]=math.number(scope[x.val],unit[x.val]);
    }
    catch(e){

    }
  });
  ipcRenderer.send('update',{'scope':values});
});

$('[data-unit]').change(function(){
  mm = mathsheet.split('\n');
  for(var i in mm){
    if(mm[i].indexOf('temp') != -1){
      mm[i] = mm[i].split(' to ')[0]+ ' to '+$(this).val();
    }
  }
  mathsheet = mm.join('\n');
  math.format(math.eval(mathsheet,scope),2);
  evaluate();
  updateTex();


});
$('[data-action="handbook"]').click(function() {
  ipcRenderer.send('handbook');
});
$('[data-export]').click(function(){
  ipcRenderer.send('export',{ex:$(this).data('export'),math:mathsheet});
});
$('[data-action="save-file"]').click(function(){
  var p= path.join(require('os').homedir(),'.datalogger','sessions',session._name+"_"+session._date+'.json');
  var pp = dialog.showSaveDialog({
    defaultPath : path.normalize(p),
    title: 'Experiment file save location' });
  if(pp!==undefined){
    ipcRenderer.send('save-file',{'path' : pp});
    if($("[name='start-stop']").prop("disabled") && $("[name='on-off']").bootstrapSwitch('state')){
      menu.items[1].submenu.items[1].enabled=true;
      $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
    }
  }
});
$('[data-action="plot"]').click(function(){
  var name=$(this).data('plot');
  ui.blocks.forEach(function(x){
    unit[x.val]=scope[x.val].units[0].unit.name;
  });
  ipcRenderer.send('plot',{'name':name});
});

$('[data-action="inputs"]').click(function(){
  if(modal!== undefined)modal.modal('toggle');
  modal=bootbox.dialog({
    message : '<div id="inputs-content"</div>',
    title : 'Gains',
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
    $('#inputs-content').empty();
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
      channels[i].gainvalues.forEach((el,j)=>{
        $(this).data("selectBox-selectBoxIt").add({value: el,text : 'x'+channels[i].gainlabels[j]});
      });
      $(this).find('option[value='+channels[i].gain+']').attr('selected','selected');
      $(this).data('selectBox-selectBoxIt').refresh();
    });
  });
  modal.modal('show');
});

$('[data-action="editequation"]').click(function() {
  if(modal!== undefined)modal.modal('toggle');
  var editor;
  modal=bootbox.dialog({
    message : ''+
    '<div class="row d-flex flex-column" style="position:relative">'+
        '<textarea class="form-control"  id="equations"></textarea>'+
      '</div>'+
      '<div class="row d-flex flex-column" style="position:relative">'+
      '<ul id="latex" style="overflow:hidden; overflow-y:scroll;">'+
      '</ul>'+
      '</div>'+
    '</div>',
    title : 'Experiment equations',
    buttons : {
      import : {
        label:'Import',
        className : 'btn-default',
        callback: function() {
          dialog.showOpenDialog({
          defaultPath : path.normalize(path.join(require('os').homedir(),'.datalogger','math','mathsheet.txt')),
        title: 'Import math file' }, function(path){
          try { mathsheet=fs.readFileSync(path[0],'utf8');  $('#latex').html(''); editor.setValue(mathsheet);}
          catch(e) { console.log(e); alert('Failed to read the file !'); }
        });
        return false;

      }
      },
      export : {
        label : 'Export',
        className : 'btn-default',
        callback: function(){
          dialog.showSaveDialog({
          defaultPath : path.normalize(path.join(require('os').homedir(),'.datalogger','math','mathsheet.txt')),
          title: 'Export math file' }, function(path){
            var result = editor.getValue();
            if(result !== null) mathsheet=result;
            try { fs.writeFileSync(path,mathsheet,'utf8'); }
            catch(e) { console.log(e); alert('Failed to save the file !'); }
          });
          return false;
        }
      },
      cancel : {
        label : 'Cancel',
        className : 'btn-default',
        callback : function(){
        }
      },
      confirm : {
        label:'Confirm',
        className: 'btn-primary',
        callback: function() {
          result = editor.getValue();
          if(result !== null) mathsheet=result;
            try{
                math.eval(mathsheet,scope);
                evaluate();
            }
            catch(err){
              dialog.showMessageBox({type: 'error',title: 'Error in math', message : err.toString()});

            }
          updateTex();
          ui.blocks.forEach(updatePopover);
        }
        },

    },
    show : false,
    onEscape : true
  });
  modal.on('shown.bs.modal',function(){
    editor = codemirror.fromTextArea(document.getElementById('equations'),{
      mode: 'javascript',
      theme : 'eclipse',
      lineNumbers: true,
      matchBrackets: true,
    });
    eq = $('#equations');
    editor.setValue(mathsheet);
    var mm = [];
    editor.getValue().split('\n').forEach(function(x){
      if(math.parse(x).toTex()!=='undefined'){
        mm.push(x);
      }
    });

    $('#latex').html('');
    $('#latex').css('maxHeight',editor.getWrapperElement().offsetHeight);
    for(var i in mm){
      try{
        var a  = math.parse(mm[i]).toTex();
        if(a!=='undefined'){
          $('#latex').append('<li class="list-group-item">$'+a+'$</li>');
        }
      }
      catch(err){
        dialog.showMessageBox({type: 'error',title: 'Error in math', message : err.toString()});
      }
    }
    mathjaxHelper.typesetMath(document.getElementById('latex'));
    editor.on('change',function(cm,chs){
      var mm = [];
      editor.getValue().split('\n').forEach(function(x,i){
        try{
        if(math.parse(x).toTex()!=='undefined'){
          mm.push(x);
        }
        }
        catch(e){}
      });
      var len = $('#latex').find('li').length;
      var i=0;
      var a;
      for(i;i < len ;i++){
        if(i<mm.length){
            a  = math.parse(mm[i]).toTex().trim();
            a = a=='undefined' ? '' : a;
            if($('#latex').find('li').eq(i).text().trim()!=a){
              if(a!=='' && a!=='undefined'){
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
  try{
  mathjaxHelper.loadMathJax(document);
  var tmp=ipcRenderer.sendSync('ready');
  channels = tmp.config.channels;
  if(mathsheet===''){
    mathsheet = tmp.config.mathsheet.trim();
  }
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
  catch(err){
    /*Raven.captureException(err);
    Raven.showReportDialog();*/
  }
}
ipcRenderer.on('init',init);




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

  var popover=$('[data-measure*="'+block.val+'"]').attr('data-content','$$' + tex[block.val].trim() + '$$').data('bs.popover');
  popover.setContent();
  popover.$tip.addClass(popover.options.placement);
}
/********************/


ipcRenderer.on('on',(event,args)=>{
  if(args.st){
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
        if(recording && $("[name='start-stop']").prop("disabled")){
          $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
          menu.items[1].submenu.items[1].enabled=true;
        }
      }
    });
  }
  else{
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
});
/* Machine controls */

function on(){
  ipcRenderer.send('on');
}

function off(){
  timer.stop();
  $('#timer').html('00:00:00');
  $("[name='start-stop']").bootstrapSwitch('state', false);
  $("[name='start-stop']").bootstrapSwitch('disabled',true);
  $('#experiment').text('');
  $('#date').text('');
  menu.items[2].submenu.items.forEach((e)=>{
    e.enabled=false;
  });
  ui.init();
  ipcRenderer.send('off');
}

function rec(){
  $.blockUI();
  menu.items[2].submenu.items.forEach((e)=>{
    e.enabled=true;
  });
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
    $('.icon-heater').addClass('hot');
    $('.icon-heater').attr({'title': 'Not safe to touch'});
  }
  else{
    $('.icon-heater').removeClass('hot');
    $('.icon-heater').attr({'title': 'Safe to touch'});
  }
}

/*****************************/
ipcRenderer.on('rec',(event,data)=>{
  recording=data.rec;
});
/**********************************/

const Menu = app.Menu;

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator : 'CmdOrCtrl+N',
        click () { $('[data-action="save-file"]').trigger('click');}
      },
      {
        label: 'Change Experiment',
        accelerator : 'CmdOrCtrl+S',
        click () {  }
      },
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'Experiment',
    submenu: [
      {
        label: 'Start-Stop',
        accelerator: 'CmdOrCtrl+Space',
        click () {  $("[name='on-off']").trigger('click'); }
      },
      {
        label: 'Record Data - Pause Recording',
        accelerator: 'CmdOrCtrl+R',
        enabled: false,
        click () { $("[name='start-stop']").trigger('click');  }
      },
      {
        label: 'Edit Experiment Math',
        accelerator: 'CmdOrCtrl+M',
        click () { $('[data-action="editequation"]').trigger('click');  }
      },
      {
        label: 'Change Channel Gain',
        accelerator: 'CmdOrCtrl+G',
        click () { $('[data-action="inputs"]').trigger('click');}
      }
    ]
  },
  {
    label: 'Export',
    submenu: [
      {
        label: 'Export to CSV',
        enabled: false,
        click () {    ipcRenderer.send('export',{ex:{"extension": "csv","sep": ","},math:mathsheet});
        }
      },
      {
        label: 'Export to TSV',
        enabled: false,
        click () {    ipcRenderer.send('export',{ex:{"extension": "tsv","sep": "\t"},math:mathsheet});
        }
      },
      {
        label: 'Open in SciDAVis',
        enabled: false,
        click () {   ipcRenderer.send('export',{ex:{"extension": "scidavis"},math:mathsheet});
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Manual',
        accelerator: 'CmdOrCtrl+H',
        click () { $('[data-action="handbook"]').trigger('click');}
      },
      {
        label: 'About Datalogger',
        click () { bootbox.dialog({
          message : ''+
          '<p>'+pjson.name+' v'+ pjson.version+'</p><p>Copyright &#9400;	 2017-2018 Fermium LABS srl. All rights reserved</p><p>Website:<a href="https://www.fermiumlabs.com" onclick="myFunction(this.href)">https://www.fermiumlabs.com</a></p><p>Technical Support: <a href="mailto:support@fermiumlabs.com" onclick="myFunction(this.href)">support@fermiumlabs.com</a></p>',
          title : 'About Datalogger',
          show : true,
          onEscape : true
        });}
      }
    ]
  },
  {
    label: 'Debug',
    submenu: [
      {
        role:'toggledevtools'
      }
    ]
  }
];


const menu = Menu.buildFromTemplate(template);
if(process.platform === 'darwin'){
  Menu.setApplicationMenu(menu);
}
else{
  app.getCurrentWindow().setMenu(menu);
}
