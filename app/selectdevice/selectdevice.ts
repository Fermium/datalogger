/*jshint esversion: 6*/
import {remote} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {ipcRenderer} from 'electron';
const jsyaml = require('js-yaml');
$(document).keydown(function(e) {
    // ESCAPE key pressed
    if (e.keyCode == 27) {
        remote.getCurrentWindow().close();
    }
});
$(document).ready(function(){
  var producers = getDirectories(path.normalize(path.join(__dirname,'devices').replace('app.asar','app.asar.unpacked').replace('selectdevice','')));
  producers.forEach(function(pr){
    updateList(pr);
  });

});

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function updateList(producer){
  var products = getDirectories(path.normalize(path.join(__dirname,'devices',producer).replace('app.asar','app.asar.unpacked').replace('selectdevice','')));
  products.forEach(function(x){
    appendProduct(producer,x);
  });
}
function appendProduct(producer,name){
  var product=jsyaml.safeLoad(fs.readFileSync(path.normalize(path.join(__dirname,'devices',producer,name,'config.yaml').replace('app.asar','app.asar.unpacked').replace('selectdevice','')))).product;
  $('.content-wrapper').append($('<div/>').addClass('col-xs-6').append($('<div/>').addClass('panel panel-default product').attr({
    'style':"-webkit-app-region: no-drag",
    'data-product':name,
    'data-producer':producer,
  })));
  $('[data-product='+name+'][data-producer='+producer+']').append($('<img/>').addClass('panel-heading').attr({
    src :  path.normalize(path.join(__dirname,'devices',producer,name,product.image).replace('app.asar','app.asar.unpacked').replace('selectdevice','')),
    alt : product.name
  }));
  $('[data-product='+name+'][data-producer='+producer+']').append($('<div/>').addClass('panel-body'));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<h4/>').text(product.name));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body h4").append($('<small/>').text(producer));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<p/>').text(product.description));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<a/>').addClass('btn btn-primary select-device').attr({
    href : '#',
    'data-device' :   path.normalize(path.join(__dirname,'devices',producer,name).replace('app.asar','app.asar.unpacked').replace('selectdevice',''))
  }).text('Next'));
  $('.select-device').each(function(x){

    $(this).click(function(){
      ipcRenderer.send('device-select',{device:$(this).data('device')});
    });
  });
}
$('#search').change(function(){
  var str = ($(this).val() as any).split(' ');
  $('[data-product]').each(function(){
    $(this).parent().fadeIn(100);
  });
  str.forEach(function(s){
    if(s!==''){
      $('.product:not([data-product*='+s+'],[data-producer*='+s+'])').parent().fadeOut(100);
    }
  });
});
