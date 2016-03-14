'use strict';

describe('window performance', function () {

	var dataForge = require('../index');

	var E = require('linq');
	var expect = require('chai').expect;

	var Stopwatch = require('statman-stopwatch');

	it('window - series', function () {

		var numItems = 100;
		var windowSize = 5;

		var series = new dataForge.Series({
			values: E.range(0, numItems).toArray(),
		});

		var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = series
			.window(windowSize, function (window, windowIndex) {
				return [windowIndex, windowIndex];
			});

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems / windowSize);

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});

	it('window - data-frame', function () {

		var numItems = 100;
		var windowSize = 5;

		var dataFrame = new dataForge.DataFrame({
			columnNames: ["c1"],
			rows: E.range(0, numItems).select(v => [v]).toArray(),
		});

		var stopwatch1 = new Stopwatch();
		stopwatch1.start();

		var newSeries = dataFrame
			.window(windowSize, function (window, windowIndex) {
				return [windowIndex, windowIndex];
			});

		stopwatch1.stop();
		var time1 = stopwatch1.read();
		//console.log('t1: ' + time1);
		expect(time1).to.be.at.most(1);

		var stopwatch2 = new Stopwatch();
		stopwatch2.start();

		expect(newSeries.count()).to.eql(numItems / windowSize);

		stopwatch2.stop();
		var time2 = stopwatch2.read();
		//console.log('t2: ' + time2);
		expect(time2).to.be.at.most(100);
	});
});