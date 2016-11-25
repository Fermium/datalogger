var remote = require('electron').remote;
var _ = require('lodash');

var file=remote.getGlobal('config')._file;
console.log(file);
var source=[{x:[],y:[]}];
Plotly.plot('plot',source);
setInterval(function(){
  if(file!=''){
  Plotly.d3.json(file,(error,data) => {
  source[0]={
  x: _.takeRight(data._data, 100).map((d) => d.timestamp),
  y: _.takeRight(data._data, 100).map((d) => d.value)
 }
  Plotly.redraw('plot');

})
}
else{
  file=remote.getGlobal('config')._file;
}
},500);
