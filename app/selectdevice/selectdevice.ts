/*jshint esversion: 6*/
import * as _ from 'lodash';
import { isDev, log } from "../util"
import {remote} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {ipcRenderer} from 'electron';
const jsyaml = require('js-yaml');
let pjson = require(path.normalize(path.join('..','..','package.json')));
const Menu = remote.Menu;
const template = [
  {
    label: 'Help',
    submenu: [
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



$(document).keydown(function(e) {
    // ESCAPE key pressed
    if (e.keyCode == 27) {
        remote.getCurrentWindow().close();
    }
});
$(document).ready(function(){
  if(process.platform === 'darwin'){
    Menu.setApplicationMenu(menu);
  }
  var producers = getDirectories(path.normalize(path.join(__dirname,'devices').replace('selectdevice','')));
  producers.forEach(function(pr){
    updateList(pr);
  });
});

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function updateList(producer){
  var products = getDirectories(path.normalize(path.join(__dirname,'devices',producer).replace('selectdevice','')));

  products.forEach(function(x){
    appendProduct(producer,x);
  });
}
function appendProduct(producer,name){
  var product=jsyaml.safeLoad(fs.readFileSync(path.normalize(path.join(__dirname,'devices',producer,name,'config.yaml').replace('selectdevice','')))).product;
  $('#devices').append($('<div/>')
    .addClass('col-lg-3 col-md-4 col-sm-4 col-xs-12 product-panel')
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
  if(!product.disabled){
    $mainCont.parent().addClass('enabled');
  }
  $mainCont.append($('<img/>').addClass('panel-heading thmb').attr({
    src : 'file://'+path.normalize(path.join(__dirname,'devices',producer,name,product.image).replace('selectdevice','')),
    alt : product.name
  }));
  $mainCont.append($('<div/>').addClass('panel-body'));
  $mainCont.find('.panel-body').append($('<h4/>').text(product.name));
  $mainCont.find('.panel-body').find("h4").append($('<small/>').css('display', 'block').html(producer));
  $mainCont.find('.panel-body').append($('<p/>').text(product.description));
  $mainCont.find('.panel-body').append($('<a/>').addClass('btn btn-primary select-device ').attr({
    href : '#',
    'data-device' : (product.disabled)? null :  path.normalize(path.join(__dirname,'devices',producer,name).replace('selectdevice','')),
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


let equalheight = function(container: string){

  var currentTallest = 0,
       currentRowStart = 0,
       rowDivs = new Array(),
       $el,
       topPosition = 0;
   $(container).each(function() {

     $el = $(this);
     $($el).height('auto')
     let topPostion = $el.position().top;

     if (currentRowStart != topPostion) {
       for (let currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
         rowDivs[currentDiv].height(currentTallest);
       }
       rowDivs.length = 0; // empty the array
       currentRowStart = topPostion;
       currentTallest = $el.height();
       rowDivs.push($el);
     } else {
       rowDivs.push($el);
       currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
    }
     for (let currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       rowDivs[currentDiv].height(currentTallest);
     }
   });
  }

  $(window).load(function() {
    equalheight('.product-panel');
    equalheight('.panel-heading');
  });
