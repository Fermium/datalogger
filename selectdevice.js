var app = require('electron').remote;
const fs = require('fs')
const path = require('path')
const {ipcRenderer} = require('electron');
const jsyaml = require('js-yaml')

$(document).keydown(function(e) {
    // ESCAPE key pressed
    if (e.keyCode == 27) {
        app.getCurrentWindow().close();
    }
});
$(document).ready(function(){
  var producers = getDirectories('./devices');
  $('select').selectBoxIt({
    autoWidth: false,
    populate : producers,
    copyClasses : "container"
  })
  $('select').change(function(){
    updateList($('select').val());
  })
updateList($('select').val());
})

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

function updateList(producer){
  var products = getDirectories('./devices/'+producer);
  products.forEach(function(x){
    appendProduct(producer,x)
  })
}
function appendProduct(producer,name){
  $('.content-wrapper').empty();
  var product=jsyaml.safeLoad(fs.readFileSync('./devices/'+producer+'/'+name+'/config.yaml')).product;
  $('.content-wrapper').append($('<div/>').addClass('col-xs-6').append($('<div/>').addClass('panel panel-default').attr({
    'id':product.model,
    'style':"-webkit-app-region: no-drag"
  })));
  $('#'+product.model).append($('<img/>').addClass('panel-heading').attr({
    src : './devices/'+producer+'/'+name+'/'+product.image,
    alt : product.name
  }));
  $('#'+product.model).append($('<div/>').addClass('panel-body'));
  $('#'+product.model+" .panel-body").append($('<h4/>').text(product.name));
  $('#'+product.model+" .panel-body").append($('<p/>').text(product.description));
  $('#'+product.model+" .panel-body").append($('<a/>').addClass('btn btn-primary select-device').attr({
    href : '#',
    'data-device' : './devices/'+producer+'/'+name+'/'
  }).text('Next'));
  $('.select-device').each(function(x){

    $(this).click(function(){
      ipcRenderer.send('device-select',{device:$(this).data('device')});
      app.getCurrentWindow().close();
    })
  })
}
