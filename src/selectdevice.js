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
  var producers = getDirectories(__dirname+'/devices/');
  /*$('select').selectBoxIt({
    autoWidth: false,
    populate : producers,
    copyClasses : "container"
  })
  $('select').change(function(){
    updateList($('select').val());
  })
  updateList($('select').val());
  */
  producers.forEach(function(pr){
    updateList(pr);
  })

})

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

function updateList(producer){
  console.log(__dirname);
  var products = getDirectories(__dirname+'/devices/'+producer);
  products.forEach(function(x){
    console.log(producer+" - "+x)
    appendProduct(producer,x);
  })
}
function appendProduct(producer,name){
  var product=jsyaml.safeLoad(fs.readFileSync(__dirname+'/devices/'+producer+'/'+name+'/config.yaml')).product;
  $('.content-wrapper').append($('<div/>').addClass('col-xs-6').append($('<div/>').addClass('panel panel-default product').attr({
    'style':"-webkit-app-region: no-drag",
    'data-product':name,
    'data-producer':producer,
  })));
  $('[data-product='+name+'][data-producer='+producer+']').append($('<img/>').addClass('panel-heading').attr({
    src : './devices/'+producer+'/'+name+'/'+product.image,
    alt : product.name
  }));
  $('[data-product='+name+'][data-producer='+producer+']').append($('<div/>').addClass('panel-body'));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<h4/>').text(product.name));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body h4").append($('<small/>').text(producer));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<p/>').text(product.description));
  $('[data-product='+name+'][data-producer='+producer+']'+" .panel-body").append($('<a/>').addClass('btn btn-primary select-device').attr({
    href : '#',
    'data-device' : __dirname+'/devices/'+producer+'/'+name+'/'
  }).text('Next'));
  $('.select-device').each(function(x){

    $(this).click(function(){
      ipcRenderer.send('device-select',{device:$(this).data('device')});
      app.getCurrentWindow().close();
    })
  })
}
$('#search').change(function(){
  var str = $(this).val().split(' ');
  console.log(str)
  $('[data-product]').each(function(){
    $(this).parent().fadeIn(100);
  });
  str.forEach(function(s){
    if(s!=''){
      $('.product:not([data-product*='+s+'],[data-producer*='+s+'])').parent().fadeOut(100);
    }
  });
})
