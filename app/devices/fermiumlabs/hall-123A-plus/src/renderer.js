var _ = require('lodash');
var blocks = [];
const EventEmitter = require('events');
var handler = new EventEmitter();
$('[data-measure]').each(function(i){
  blocks.push($(this).data('measure'));
})

module.exports = {
  blocks,
  handler,
  init : function(inputs){
    var form = $('#input-form');
    inputs.forEach(function(input){
      form.append($('<div/>').addClass('form-group').attr('id',input.name));
      $('#'+input.name).append($('<label/>').attr({
        'for' : 'input-'+input.name,
        'class' : 'col-sm-3 col-md-3 col-xs-3 control-label'
      }).text(input.name));
      $('#'+input.name).append($('<div/>').addClass('col-sm-9 col-md-9 col-xs-9 input'));
      $('#'+input.name+" .input").append($('<input/>').attr({
        'id' : 'input-'+input.name,
        'name' : input.name,
        'type' : input.type !== 'slider' ? input.type : 'text',
        'class' : 'form-control',
        'from' : input.type != 'slider' ? input.min : '',
        'to' : input.type != 'slider' ? input.max : '',
        'step': input.type != 'slider' ? input.step: '',
        'value' : input.type != 'slider' ? input.default : '',
        'data-min' : input.type != 'slider' ? '' : input.min,
        'data-max' : input.type != 'slider' ? '' : input.max,
        'data-from' :  input.type != 'slider' ? '' : input.default,
        'data-step': input.type != 'slider' ? '' : input.step,
        'data-slider' : input.type=='slider',
        'data-hardware' : input.sendtohardware
      }));
    });
    $('input[data-slider=true]').each(function(i){
      $(this).ionRangeSlider();
    });
    $('input[id*="input-"]').each(function(i){
      $(this).change(_.debounce(function(){
          handler.emit('input-change',{id:$(this).attr('name'),value:$(this).val(),hardware:$(this).data('hardware')});
      },500));
    });
  }
}
