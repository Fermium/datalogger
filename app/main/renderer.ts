/*  NodeJS Requires  */
/*jshint esversion: 6*/
/// <reference types='bootstrap' />
/// <reference types='bootstrap-switch' />
/// <reference types='jquery.blockui' />
/// <reference types='jquery.pnotify' />
import * as path from 'path';
let _ = require('lodash');
const {shell} = require('electron')
import * as math from 'mathjs';
import * as mathjaxHelper from 'mathjax-electron';
import * as easytimer from 'easytimer';
import * as codemirror from 'codemirror';
import * as fs from 'fs';
let pjson = require(path.normalize(path.join('..','..','package.json')));
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
let recording;
declare var ui : any;
declare const MathJax: any;
/* End NodeJS Requires */
/* Electron requires */
interface JQuery {
  'selectBoxIt' : any
}
const app = require('electron').remote;
const {ipcRenderer} = require('electron');
let dialog = app.dialog;
let session = app.getGlobal('session');
declare var waitingDialog : any;
/* End Electron requires */

/* Variables */
let scope = {};
let timer = new easytimer();
let tex = {};
let mathsheet = "";
interface Obj {
  [k:string]:any
}
let channels : Obj;
let calibration : Obj;
let unit = {};
let is_on : boolean = false;
let modal;

let pnotifyStack = {dir1: "up", dir2: "left"};
let pnotifyButtons = {
  closer: true
}

/* End Variables */

/**************************************************/
$(document).ready(function(){
  init();
  $("[name='start-stop']").bootstrapSwitch({
      onText: '<i class="fa fa-pause" aria-hidden="true"></i>',
      offText: '<i class="fa fa-circle" aria-hidden="true"></i>',
      onSwitchChange: (event, state) => {
        if (state) {
          rec();
        } else {
          pause();
        }
      }
  });
  $("[name='on-off']").bootstrapSwitch({
    onText: '<i class="fa fa-power-off" aria-hidden="true"></i>',
    offText: '<i class="fa fa-power-off" aria-hidden="true"></i>',
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
ipcRenderer.on('usb-error',function(event,args){
  $("[name='on-off']").bootstrapSwitch('state', false);
  bootbox.alert({
    size: 'small',
    title : 'USB device disconnected',
    message: 'USB device has been disconnected or powered off.',
    callback : function(){
    }
  });

});

ipcRenderer.on('measure',function(event,args){
  _.extend(scope,args.scope);
  math.format(math.eval(mathsheet,scope),2);
  evaluate();
  check_temp();
  let values={};
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
  let mm = mathsheet.split('\n');
  for(let i in mm){
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

ipcRenderer.on('exported',(ev,args)=>{
  waitingDialog.hide();
  shell.showItemInFolder(args.path);
  $.unblockUI();

});
$('[data-action="save-file"]').click(function(){
  let p= path.join(require('os').homedir(),'.datalogger','sessions',session._name+"_"+session._date+'.json');
  let pp = dialog.showSaveDialog({
    defaultPath : path.normalize(p),
    title: 'Experiment file save location' });
  if(pp!==undefined){
    ipcRenderer.send('save-file',{'path' : pp});
    if($("[name='start-stop']").prop("disabled") && $("[name='on-off']").bootstrapSwitch('state')){
      (<any>menu.items[1]).submenu.items[1].enabled=true;
      $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
    }
  }
});
$('[data-action="plot"]').click(function(){
  let name=$(this).data('plot');
  ui.blocks.forEach(function(x){
    unit[x.val]=scope[x.val].units[0].unit.name;
  });
  ipcRenderer.send('plot',{'name':name});
});

// $('[data-action="inputs"]').click(_.debounce(function(){
//   if(modal!==undefined) modal.modal('hide');
//   modal=bootbox.dialog({
//     message : '<div id="inputs-content"</div>',
//     title : 'Gains',
//     buttons : {
//       danger : {
//         label : 'Cancel',
//         className : 'btn-default',
//         callback : function(){
//         }
//       },
//       success : {
//         label:'Confirm',
//         className: 'btn-primary',
//         callback: function() {
//           $('select.gain').each(function(i){
//             channels[i].gain = $(this).val();
//             ipcRenderer.send('send-to-hardware',{id:'set_gain',channel: channels[i].code,value:channels[i].gain});
//           });
//         }
//       }
//     },
//     show : false,
//     onEscape : true
//   });
//   modal.on('shown.bs.modal',function(){
//     let i;
//     let $iContent = $('#inputs-content');
//     $iContent.empty();

//     for(i=0;i<channels.length;i++){
//       console.log(channels[i]);
//       $iContent.append($('<div/>').addClass('row').append(
//         '<div class="col-md-3 col-sm-3 col-xs-3">'+
//         channels[i].name+
//         '</div><div class="col-md-3 col-sm-3 col-xs-3">'+
//         '<select class="gain"></select></div><div class="col-md-6 col-sm-6 col-xs-6">'+
//         channels[i].description+
//         '</div>'));
//     }

//     $('.gain').each(function(i){
//       ($(this) as any).selectBoxIt({
//         autoWidth: false,
//         copyClasses : "container",
//       });
//       channels[i].gainvalues.forEach((el,j)=>{
//         $(this).data("selectBox-selectBoxIt").add({value: el,text : 'x'+channels[i].gainlabels[j]});
//       });
//       $(this).find('option[value='+channels[i].gain+']').attr('selected','selected');
//       $(this).data('selectBox-selectBoxIt').refresh();
//     });
//   });

//   modal.modal('show');
// },200));

$('[data-action="inputs"]').click(_.debounce(function(){
  if(modal!==undefined) modal.modal('hide');
  modal=bootbox.dialog({
    message : '<div id="inputs-content"</div>',
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

  modal.on('shown.bs.modal',function(){
    let $iContent = $('#inputs-content');
    $iContent.empty();
    let html = '';
    html += `<!-- Table -->
              <table class="table">
              <thead>
                  <tr>
                    <td>Variable</td>
                    <td>Gain</td>
                    <td>Description</td>
                  </tr>
              </thead>
              <tbody>`;
              for(let i=0; i < channels.length; i++){
                html += `
                  <tr>
                    <td>${channels[i].name}</td>
                    <td>
                      <select class="gain">`
                     for(let j = 0; j <= channels[i].gainlabels; j++){
                       html += `<option value="${channels[i].gainvalues[j]}" >${channels[i].gainlabels[j]}</option>`;
                     }
                html +=`</select>
                    </td>
                    <td>
                     <div class='var-desc'>
                     ${channels[i].description}
                     </div>
                    </td>
                  </tr>
                `;
              }
    html +=   `</tbody></table>`;
    $iContent.html(html);
    $('.gain').each(function(i){
      ($(this) as any).selectBoxIt({
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
},200));

$('[data-action="editequation"]').click(_.debounce(function() {
  if(modal!==undefined)modal.modal('hide');
  let editor;
  modal=bootbox.dialog({
    className: 'math-sheet',
    message : '<div class="eq-alert" style="display:none"></div>  <div id=\'eqmodal\'>'+
    '<div class="row d-flex flex-column " style="position:relative">'+
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
            let result = editor.getValue();
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
          modal.showing=undefined;
        }
      },
      confirm : {
        label:'Confirm',
        className: 'btn-primary',
        callback: function() {
          let $eqAlert = $(".eq-alert");
          $eqAlert.removeClass("alert-success")
                  .removeClass("alert-danger")
          try{
            let result = editor.getValue();
            if(result !== null) mathsheet=result;
            if(is_on){
              math.eval(mathsheet,scope);
              evaluate();
            }
            updateTex();
            ui.blocks.forEach(updatePopover);
            $eqAlert
              .addClass("alert alert-success")
              .text("Equations has been successfully saved.")
              .show();
          }catch(e){
            $eqAlert
              .addClass("alert alert-danger")
              .text(`Error in math: ${e.toString()}`)
              .show();
                // dialog.showMessageBox({type: 'error',title: 'Error in math', message : err.toString()});

          }

          $(".bootbox").animate({
            scrollTop: 0
          }, 100);
          return false;
        },

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
    let eq = $('#equations');
    editor.setValue(mathsheet);
    let mm = [];
    editor.getValue().split('\n').forEach(function(x){
      if(math.parse(x).toTex()!=='undefined'){
        mm.push(x);
      }
    });

    $('#latex').html('');
    $('#latex').css('maxHeight',editor.getWrapperElement().offsetHeight);
    for(let i in mm){
      try{
        let a  = math.parse(mm[i]).toTex();
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
      let mm = [];
      editor.getValue().split('\n').forEach(function(x,i){
        try{
        if(math.parse(x).toTex()!=='undefined'){
          mm.push(x);
        }
        }
        catch(e){}
      });
      let len = $('#latex').find('li').length;
      let i=0;
      let a;
      let removed=0;
      for(i;i < len ;i++){
        if(i<mm.length){
          console.log('minore')
            a  = math.parse(mm[i]).toTex().trim();
            a = a=='undefined' ? '' : a;
            if($('#latex').find('li').eq(i).text().trim()!=a){
              if(a!=='' && a!=='undefined'){
                $('#latex').find('li').eq(i).text('$'+a+'$');
                mathjaxHelper.typesetMath($('#latex').find('li').eq(i).get(0));
              }
              else{
                $('#latex').find('li').eq(i-removed).remove();
                removed++;
              }
            }
          }
          if(i>=mm.length){
            console.log('maggiore')
            $('#latex').find('li').eq(i-removed).remove();
            removed++;
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
  modal.on('hide.bs.modal',()=>{
    if(parseFloat($('body').css('padding-right'))>0){
      console.log('padding');
      $('body').css('padding-right',0);
    }
  });
  modal.modal('show');
},200));


/* End Events */

function init(){
  try{
  mathjaxHelper.loadMathJax(document);
  var tmp=ipcRenderer.sendSync('ready');
  channels = tmp.config.channels;
  calibration = tmp.config.calibration;
  if(mathsheet===''){
    mathsheet = tmp.config.mathsheet.trim();
  }
  let inputs = tmp.config.inputs;
  inputs.forEach(function(input){
    if(!input.sendtohardware){
      scope[input.name]=input.default;
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
ipcRenderer.on('usb-init',init);




function inputhandler(data){
  if(data.hardware){
    ipcRenderer.send('send-to-hardware',{id:data.id,value:data.value});
  }
  else{
    scope[data.id]=data.value;
  }
}


function updateTex(){
  let nodes = mathsheet.split('\n');
  nodes.forEach(function(n){
    if(n.indexOf('=')!==-1){
      let nn=n.split('=');
      tex[nn[0].trim()]=math.parse(nn[1].trim()).toTex();
    }
  });
}
function evaluate() {
  for (let block in ui.blocks) {
    let bb = ui.blocks[block];
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
      content: '<div class="mathjax-formula" id="' + block.val + '_formula">$$' + tex[block.val] + '$$</div>'
    }).on('shown.bs.popover', function() {
      MathJax.Hub.Queue(function () {
        mathjaxHelper.typesetMath(document.getElementById(block.val + '_formula'));
        $(`#${block.val}_formula`).show();
      });

    })
    .on('hide.bs.popover', function() {
      $(`#${block.val}_formula`).hide();
    });
  }
}


function updatePopover(block){

  let popover=$('[data-measure*="'+block.val+'"]').attr('data-content','$$' + tex[block.val].trim() + '$$').data('bs.popover');
  popover.setContent();
  popover.$tip.addClass(popover.options.placement);
}
/********************/


ipcRenderer.on('on',(event,args)=>{
  is_on = args.st;
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
        let text = result.trim() === '' ? session._name : result;
        session._name = text;
        $('#session').text(text);
        $('#date').text(' - ' + session._date);
        if(recording && $("[name='start-stop']").prop("disabled")){
          $("[name='start-stop']").bootstrapSwitch('toggleDisabled');
          (<any>menu.items[1]).submenu.items[1].enabled=true;
        }
      }
    });
  }
  else{
    $("[name='on-off']").bootstrapSwitch('state',false);
    bootbox.confirm({
      size: 'small',
      title : 'Unable to find the instrument',
      message: 'Please verify it is connected to the USB and powered on.<br>On Unix, also check for access permissions',
      buttons: {
        cancel: {
            label: 'Cancel'
        },
        confirm: {
            label: 'Retry'
        }
    },
      callback: function(result){
        if(result){
          $("[name='on-off']").bootstrapSwitch('state',true);
        }
      }
    });
  }
  $.unblockUI();
});
/* Machine controls */

function on(){
  ipcRenderer.send('on');
  $.blockUI({message:null});
}

function off(){
  timer.stop();
  $('#timer').html('');
  $("[name='start-stop']").bootstrapSwitch('state', false);
  $("[name='start-stop']").bootstrapSwitch('disabled',true);
  $('#experiment').text('Unnamed Experiment');
  $('#date').text('');
  (<any>menu.items[2]).submenu.items.forEach((e)=>{
    e.enabled=false;
  });
  ui.init();
  is_on=false;
  ipcRenderer.send('off');
}

function rec(){
  $.blockUI({message:null});
  (<any>menu.items[2]).submenu.items.forEach((e)=>{
    e.enabled=true;
  });
  ipcRenderer.send('start');
  ipcRenderer.on('started',function(event,args){
    PNotify.removeAll();
    if(!args.return){
      $("[name='start-stop']").bootstrapSwitch('state', false);
    } else {
      new PNotify({
        title: 'Recording Started',
        text: '',
        icon: false,
        type: 'info',
        styling: 'bootstrap3',
        addclass: 'stack-bottom-right',
        animate_speed: 'fast',
        buttons: pnotifyButtons,
        stack: pnotifyStack,
        delay: 2500
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
  PNotify.removeAll();
  ipcRenderer.send('stop');
  timer.pause();
  new PNotify({
    title: 'Recording Stopped',
    text: '',
    icon: false,
    type: 'info',
    styling: 'bootstrap3',
    addclass: 'stack-bottom-right',
    animate_speed: 'fast',
    buttons: pnotifyButtons,
    stack: pnotifyStack,
    delay: 2500
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
ipcRenderer.on('scidavis-error',(event,data)=>{
  console.log('error');
  bootbox.alert({
    size: 'small',
    title : 'Unable to find SciDAVis',
    message: 'SciDAVis is not installed or not in the default installation path.',
    callback : function(){
      waitingDialog.hide();
      $.unblockUI();
    }
  });
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
        click () {  ipcRenderer.send('relaunch') }
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
        click () {$('[data-action="editequation"]').trigger('click');}
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
        click () {  $.blockUI({message:null});  ipcRenderer.send('export',{ex:{"extension": "csv","sep": ","},math:mathsheet}); 
        waitingDialog.show("Exporting...",{dialogSize: 'sm'});
        $.blockUI({message:null});
        }
      },
      {
        label: 'Export to TSV',
        enabled: false,
        click () {  $.blockUI({message:null});  ipcRenderer.send('export',{ex:{"extension": "tsv","sep": "\t"},math:mathsheet});
        waitingDialog.show("Exporting...",{dialogSize: 'sm'});
        $.blockUI({message:null});
        }
      },
      {
        label: 'Open in SciDAVis',
        enabled: false,
        click () {  $.blockUI({message:null});  ipcRenderer.send('export',{ex:{"extension": "scidavis"},math:mathsheet});
        waitingDialog.show("Exporting...",{dialogSize: 'sm'});
        $.blockUI({message:null});
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
        label: `About ${pjson.name}`,
        click () {
          let html = `
            <div style="text-align:center">
              <img src="../assets/images/fermiumlabs.svg" />
              <p>${pjson.name} v${pjson.version}</p>
              <p>Copyright &#9400;	 2017-2018 Fermium LABS srl. All rights reserved</p>
              <p>Website: <a href="https://www.fermiumlabs.com" onclick="myFunction(this.href)">https://www.fermiumlabs.com</a></p>
              <p>Technical Support: <a href="mailto:support@fermiumlabs.com" onclick="myFunction(this.href)">support@fermiumlabs.com</a></p>
            </div>
          `;
          bootbox.dialog({
            message : html,
            title : 'About Datalogger',
            show : true,
            onEscape : true
          });
        }
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
