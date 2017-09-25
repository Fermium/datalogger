/*jshint esversion: 6*/
import { isDev, log } from "../util"

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
  $('#devices').append($('<div/>')
    .addClass('col-lg-4 col-md-4 col-sm-4 col-xs-12')
    .append($('<div/>')
    .addClass('panel panel-default product')
    .attr({
    'id': product.model,
    'style':"-webkit-app-region: no-drag",
    'data-manufacturer':product.manufacturer.toLowerCase(),
    'data-manufacturercode':product.manufacturercode.toLowerCase(),
    'data-name':product.name.toLowerCase(),
    'data-model':product.model.toLowerCase()
  })));

  var $mainCont = $(`#${product.model}`);
  $mainCont.append($('<img/>').addClass('panel-heading').attr({
    src :  path.normalize(path.join(__dirname,'devices',producer,name,product.image).replace('app.asar','app.asar.unpacked').replace('selectdevice','')),
    alt : product.name
  }));
  $mainCont.append($('<div/>').addClass('panel-body'));
  $mainCont.find('.panel-body').append($('<h4/>').text(product.name));
  $mainCont.find('.panel-body').find("h4").append($('<small/>').css('display', 'block').html(producer));
  $mainCont.find('.panel-body').append($('<p/>').text(product.description));
  $mainCont.find('.panel-body').append($('<a/>').addClass('btn btn-primary select-device ').attr({
    href : '#',
    'data-device' : (product.disabled)? null :  path.normalize(path.join(__dirname,'devices',producer,name).replace('app.asar','app.asar.unpacked').replace('selectdevice','')),
    disabled : product.disabled
  }).text((product.disabled)?'Coming Soon' : 'Next'));

  $('.select-device').each(function(x){
    if(!product.disabled){
    $(this).click(function(){
      ipcRenderer.send('device-select',{device:$(this).data('device')});
    });
  }
  });
}
$('#search').change(function(){
  var str = ( $(this).val() as any).split(' ');
  var $products = $('.product');

  $products.map((idx, elem) => $(elem).parent().fadeIn(100));

  if($(this).val() != ''){
    $products.map((idx, elem) => {
      let productInfo: any = Object.assign({}, elem.dataset);
      let showProduct: boolean = false;
      for(let data in productInfo){
        for(let i = 0; i < str.length; i++){
          if(productInfo[data].indexOf(str[i].toLowerCase()) > -1){
            showProduct = true;
            break;
          }
        }
      }
      showProduct ? $(elem).parent().fadeIn(100) : $(elem).parent().fadeOut(100);
    });
  }

});
