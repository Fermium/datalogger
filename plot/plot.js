var remote = require('electron').remote;
var _ = require('lodash');
var config = remote.getGlobal('config');
var file=config._file;
var source = config.source;
var scope = remote.getGlobal('scope');
const {ipcRenderer} = require('electron');

var graph = new Rickshaw.Graph({
  element : document.getElementById('plot'),
	renderer : 'line',
  series : new Rickshaw.Series([{ name: 'ch6' }])
});

graph.render();
var axes = new Rickshaw.Graph.Axis.Time( {
	graph: graph
} );


axes.render();

ipcRenderer.on('update',(event,data)=>{
	console.log(data.scope);
	graph.series.addData(data.scope);
	graph.update();
});
