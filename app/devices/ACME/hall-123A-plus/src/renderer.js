var _ = require('lodash');
var blocks = [];
const EventEmitter = require('events');
var handler = new EventEmitter();
$('[data-measure]').each(function(i){
  blocks.push($(this).data('measure'));
});

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
      if(input.type=='slider'){
        $('#'+input.name+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.name+"-t",
          'type' :  'number',
          'min' : input.min,
          'max': input.max,
          'step' : input.step,
          'class' : 'form-control slider-value col-md-3',
          'value' : input.default
        }));
        $('#'+input.name+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.name,
          'name' : input.name,
          'type' :  'text' ,
          'class' : 'form-control col-md-9',
          'data-min' : input.min,
          'data-max' :  input.max,
          'data-from' : input.default,
          'data-step':  input.step,
          'data-slider' : input.type=='slider',
          'data-hardware' : input.sendtohardware
        }));
      }
      else {
        $('#'+input.name+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.name,
          'name' : input.name,
          'type' : input.type,
          'class' : 'form-control',
          'from' : input.min,
          'to' :  input.max ,
          'step': input.step,
          'value' : input.default ,
          'data-hardware' : input.sendtohardware
        }));
      }

    });
    $('input[data-slider=true]').each(function(i){
      var id = this.id;
      $(this).ionRangeSlider({
        onChange: function(data){
          $('#'+id+'-t').val(data.from);
        }
      });
      $('#'+id+'-t').on('change',function(){
        var slider = $('#'+id).data('ionRangeSlider');
        slider.update({
          from : $(this).val()
        });
        if($(this).val()>slider.result.max){
          $(this).val(slider.result.max);
        }
        if($(this).val()<slider.result.min){
          $(this).val(slider.result.min);
        }
      });


    });
    $('input[id*="input-"]').each(function(i){
      $(this).change(_.debounce(function(){
          handler.emit('input-change',{id:$(this).attr('name'),value:$(this).val(),hardware:$(this).data('hardware')});
      },1000));
    });
  }
};
