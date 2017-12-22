/*jshint esversion: 6*/
import {remote} from 'electron';
var _ = require('lodash');
var config = remote.getGlobal('session');
var source = config.source;
var scope = remote.getGlobal('scope');
import {ipcRenderer} from 'electron';
declare var Rickshaw : any;
var play=true;

// instantiate our graph!
var tv : number = 1000;

var graph = new Rickshaw.Graph( {
	element: document.getElementById("plot"),
	width: window.innerWidth - 20,
	height: window.innerHeight - 20,
  renderer: 'line',
	interpolation: 'step-after',
  min: 'auto',
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
	formatter: function(series, x, y) {
        var date = '<span class="date">' + new Date(x * 1000).toLocaleTimeString() + '</span>';
        var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
        var content = swatch + series.name + ": " + y.toFixed(4) + '<br>' + date;
        return content;
    }
} );
graph.render();
var xAxes = new Rickshaw.Graph.Axis.X( {
	graph: graph,
	tickFormat: function(x){
		return new Date(x*1000).toLocaleTimeString();
	},
	ticks: 4,
} );

xAxes.render();
var yAxis = new Rickshaw.Graph.Axis.Y({
    graph: graph,
});

yAxis.render();

ipcRenderer.on('update',(event,data)=>{
  let dataplot : any = {};
  dataplot.val=data.val;
	graph.series.addData(dataplot);
	if(play){
		graph.update();
	}
});

$(window).on('resize', function(){
  graph.configure({
    width: window.innerWidth - 20,
    height: window.innerHeight - 20
  });
  graph.render();
});
$('#stopplay').click(()=>{
	play=!play
})
