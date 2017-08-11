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
  inputs : [],
  init : function(n_inputs=this.inputs){
    $('[data-measure]').each(()=>{
      this.text(this.data('measure').val);
    });
    _.merge(this.inputs,n_inputs);
    var form = $('#input-form');
    form.empty();
    $('[data-unit]').val('degC');
    $('[data-unit]').selectpicker('refresh');
    this.inputs.forEach(function(input){
      form.append($('<div/>').addClass('form-group').attr('id',input.function));
      $('#'+input.function).append($('<label/>').attr({
        'for' : 'input-'+input.function,
        'class' : 'col-sm-3 col-md-3 col-xs-3 control-label'
      }).text(input.name));
      $('#'+input.function).append($('<div/>').addClass('col-sm-9 col-md-9 col-xs-9 input'));
      if(input.type=='slider'){
        $('#'+input.function+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.function+"-t",
          'type' :  'number',
          'min' : input.min*(input.pretty)?100:1,
          'max': input.max*(input.pretty)?100:1,
          'step' : input.step*(input.pretty)?100:1,
          'class' : 'form-control slider-value col-md-3',
          'value' : input.default
        }));
        $('#'+input.function+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.function,
          'name' : input.name,
          'type' :  'text' ,
          'class' : 'form-control col-md-9',
          'data-min' : input.min,
          'data-max' :  input.max,
          'data-from' : input.default,
          'data-step':  input.step,
          'data-slider' : input.type=='slider',
          'data-pretty' : false | input.pretty,
          'data-function' : input.function,
          'data-hardware' : input.sendtohardware
        }));
      }

      else {
        $('#'+input.function+" .input").append($('<input/>').attr({
          'id' : 'input-'+input.function,
          'name' : input.name,
          'type' : input.type,
          'class' : 'form-control',
          'from' : input.min,
          'to' :  input.max ,
          'step': input.step,
          'value' : input.default ,
          'data-function' : input.function,
          'data-hardware' : input.sendtohardware
        }));
      }

    });
    $('input[data-slider=true]').each(function(i){
      var id = this.id;
      var pretty = $(this).data('pretty');
      if(pretty){
        $(this).ionRangeSlider({
          onChange: function(data){
            $('#'+id+'-t').val((data.from*100).toFixed(2));
          },
          prettify: function (num) {
              return (num * 100).toFixed(2);
          },
          postfix: ' %'
        });
      }
      else{
        $(this).ionRangeSlider({
          onChange: function(data){
            $('#'+id+'-t').val(data.from);
          },
        });
      }
      $('#'+id+'-t').on('change',function(){
        var slider = $('#'+id).data('ionRangeSlider');
        slider.update({
          from : $(this).val()/(pretty*99+1)
        });
        if($(this).val()>slider.result.max*pretty*100){
          $(this).val(slider.result.max*pretty*100);
        }
        if($(this).val()<slider.result.min*pretty*100){
          $(this).val(slider.result.min);
        }
      });


    });
    $('input[id*="input-"]').each(function(i){
      $(this).change(_.debounce(function(){
          handler.emit('input-change',{id:$(this).data('function'),value:$(this).val(),hardware:$(this).data('hardware')});
      },1000));
    });

  }
};
