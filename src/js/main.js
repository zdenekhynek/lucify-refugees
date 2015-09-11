
var d3 = require('d3');
var topojson = require('topojson');
var _ = require('underscore');

window.Vec2 = require('Vec2');

var moment = require('moment');

var RefugeeMap = require('./refugee-map.js');
var RefugeeModel = require('./refugee-model.js');

var Promise = require("bluebird");
Promise.promisifyAll(d3);


// latitude = y
// longitude = x

console.time("load topomap")

var topomap;
var asylumData;


var onceLoaded = function() {
	console.timeEnd("load json");
	
	var fc = topojson.feature(topomap, topomap.objects.map);
	window.fc = fc;

	console.time("init refugee model")
	var rmodel = new RefugeeModel(fc, asylumData);
	console.timeEnd("init refugee model")

	console.time("init map")
	var rmap = new RefugeeMap(rmodel);
	console.timeEnd("init map")

	window.rmodel = rmodel;
	window.rmap = rmap;

	runAnimation();
}


var load = function() {
	console.time("load json");
	var p1 = d3.jsonAsync('topomap.json').then(function(data) {
		topomap = data;
	});

	var p2 = d3.jsonAsync('asylum.json').then(function(data) {
		asylumData = data;
	}.bind(this));

	Promise.all([p1, p2]).then(onceLoaded, function(error){
	    throw error;
	});
}


var runAnimation = function() {
	rmodel.currentMoment = moment(new Date(2015, 3, 25));
	window.setInterval(function() {
		rmodel.currentMoment.add(1, 'hours');
		//console.log(rmodel.currentMoment.format());
		rmodel.updateActiveRefugees();
		rmap.drawRefugeePositions();

		d3.select('#time')
			.text(rmodel.currentMoment.format('DD.MM.YYYY  HH:mm:ss'));

	}, 25);
}

load();