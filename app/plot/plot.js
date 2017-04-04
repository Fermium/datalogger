var remote = require('electron').remote;
var _ = require('lodash');
var config = remote.getGlobal('session');
var source = config.source;
var scope = remote.getGlobal('scope');
const {ipcRenderer} = require('electron');


// instantiate our graph!
var tv = 1000;

var graph = new Rickshaw.Graph( {
	element: document.getElementById("plot"),
	width: window.innerWidth - 20,
	height: window.innerHeight - 20,
  renderer: 'line',
	interpolation: 'step-after',
	series: new Rickshaw.Series.FixedDuration(
		[
			{name : 'val'},
		],undefined,{
		timeInterval : 100,
		maxDataPoints : 1000,
		timeBase: new Date().getTime() / 1000
	})
} );
var hoverDetail = new Rickshaw.Graph.HoverDetail( {
	graph: graph,
	xFormatter: function(x) {
		return new Date(x * 1000).toString();
	}
} );
graph.render();
var xAxes = new Rickshaw.Graph.Axis.X( {
	graph: graph
} );

xAxes.render();
var yAxis = new Rickshaw.Graph.Axis.Y({
    graph: graph
});

yAxis.render();
var legend = new Rickshaw.Graph.Legend( {
	graph: graph,
	element: document.getElementById('legend')
} );
var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	graph: graph,
	legend: legend
} );
var order = new Rickshaw.Graph.Behavior.Series.Order( {
	graph: graph,
	legend: legend
} );
var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
	graph: graph,
	legend: legend
} );

ipcRenderer.on('update',(event,data)=>{
  dataplot = {};
  dataplot.val=data.val;
	graph.series.addData(dataplot);
	graph.update();
});

$(window).on('resize', function(){
  graph.configure({
    width: window.innerWidth - 20,
    height: window.innerHeight - 20
  });
  graph.render();
});
