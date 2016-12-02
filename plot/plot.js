var remote = require('electron').remote;
var _ = require('lodash');
var d3 = Plotly.d3;
var config = remote.getGlobal('config');
var file=config._file;
var source=[{x:[],y:[]},{x:[],y:[]},{x:[],y:[]},{x:[],y:[]},{x:[],y:[]},{x:[],y:[]},{x:[],y:[]},{x:[],y:[]}];
var gd3 = d3.select('#plot').style({
  height : '100%',
  width : '100%',
  position: 'absolute'
});
gd = gd3.node();
Plotly.plot(gd,source, {
  title: config._experiment,
  font: {
    size : 16
  }
});
window.onresize = function() {
    Plotly.Plots.resize(gd);
};

setInterval(function(){
  if(file!=''){
  Plotly.d3.json(file,(error,data) => {
  for(var i=0;i<8;i++){
   source[i]={
    x: _.takeRight(data._data, 100).map((d) => d.timestamp),
    y: _.takeRight(data._data, 100).map((d) => d['ch'+(i+1)])
   }

   console.log(source[i]);
 }
  Plotly.redraw('plot');
})
}
else{
  file=config._file;
}
},500);
