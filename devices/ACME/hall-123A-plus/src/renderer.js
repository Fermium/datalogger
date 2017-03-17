var blocks = [];

$('[data-measure]').each(function(i){
  blocks.push($(this).data('measure'));
})

module.exports = {
  blocks,
  init_ui : function(inputs){
    
  }
}
