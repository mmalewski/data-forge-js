'use strict';

//
// Implements a lazily evaluated data frame.
//

var LazySeries = require('./lazyseries');

var assert = require('chai').assert;
var E = require('linq');

var LazyDataFrame = function (columnNames, index, valuesFn) {
	assert.isArray(columnNames, "Expected 'columnNames' parameter to LazyDataFrame constructor to be an array.");
	assert.isObject(index, "Expected 'index' parameter to LazyDataFrame constructor be an index object.");
	assert.isFunction(valuesFn, "Expected 'values' parameter to LazyDataFrame constructor to be a function.");
	
	var self = this;
	self._columnNames = columnNames;
	self._index = index;
	self._valuesFn = valuesFn;	
};

//
// Maps a column name to an array index.
// Returns -1 if the requested column was not found.
//
LazyDataFrame.prototype._columnNameToIndex = function (columnName) {
	assert.isString(columnName, "Expected 'columnName' parameter to _columnNameToIndex to be a non-empty string.");
	
	var self = this;
	for (var i = 0; i < self._columnNames.length; ++i) {
		if (columnName == self._columnNames[i]) {
			return i;
		}
	}	
	
	return -1;
};

LazyDataFrame.prototype.series = function (columnName) {
	var self = this;
	var columnIndex = self._columnNameToIndex(columnName);
	if (columnIndex < 0) {
		throw new Error("In call to 'series' failed to find column with name '" + columnName + "'.");
	}
	
	// Extract values for the column.
	var valuesFn = function () {
		return E.from(self.values())
			.select(function (entry) {
				return entry[columnIndex];
			})
			.toArray();
	};
	
	return new LazySeries(self._index, valuesFn);
};

LazyDataFrame.prototype.index = function () {
	var self = this;
	return self._index;	
};

LazyDataFrame.prototype.columns = function () {
	var self = this;
	return self._columnNames;
};

LazyDataFrame.prototype.values = function () {
	var self = this;
	return self._valuesFn();
};

LazyDataFrame.prototype.subset = function (columnNames) {
	var self = this;
	
	assert.isArray(columnNames, "Expected 'columnName' parameter to 'subset' to be an array.");	
	
	var columnIndices = E.from(columnNames)
		.select(function (columnName) {
			return self._columnNameToIndex(columnName);
		})
		.toArray();

	var valuesFn = function () {
		return E.from(self.values())
			.select(function (entry) {
				return E.from(columnIndices)
					.select(function (columnIndex) {
						return entry[columnIndex];					
					})
					.toArray();
			})
			.toArray();
	};
	
	return new LazyDataFrame(columnNames, self._index, valuesFn);	 
};

//
// Bake the lazy data frame to a normal data frame. 
//
LazyDataFrame.prototype.bake = function () {
	var DataFrame = require('./dataframe'); // Local require, to prevent circular reference.
	
	var self = this;
	return new DataFrame(self._columnNames,	self._index, self.values());
};

//
// Save the data frame via plugable output.
//
LazyDataFrame.prototype.as = function (formatPlugin, formatOptions) {
	assert.isObject(formatPlugin, "Expected 'formatPlugin' parameter to 'DataFrame.as' to be an object.");
	assert.isFunction(formatPlugin.to, "Expected 'formatPlugin' parameter to 'DataFrame.as' to be an object with a 'to' function.");

	var self = this;	
	return {
		to: function (dataSourcePlugin, dataSourceOptions) {
			assert.isObject(dataSourcePlugin, "Expected 'dataSourcePlugin' parameter to 'DataFrame.as.to' to be an object.");
			assert.isFunction(dataSourcePlugin.write, "Expected 'dataSourcePlugin' parameter to 'DataFrame.as.to' to be an object with a 'write' function.");
			
			var textData = formatPlugin.to(self, formatOptions);
			return dataSourcePlugin.write(textData, dataSourceOptions);		
		},		
	};
};

//
// Get all data as an array of arrays (includes index and values).
//
LazyDataFrame.prototype.rows = function () {
	var self = this;
	return E
		.from(self._index.values())
		.zip(self.values(), function (index, values) {
			return [index].concat(values);
		})
		.toArray();
};

module.exports = LazyDataFrame;