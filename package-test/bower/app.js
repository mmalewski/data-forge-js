'use strict'

$(function() {
	
	//
	// Helper function for plotting.
	//
	var plot = function (id, indexColumnName, dataFrame) {
		var index = dataFrame.getColumn(indexColumnName).getValues();
		var remainingColumns = dataFrame.dropColumn(indexColumnName).getColumns();

		var flotSeries = E.from(remainingColumns)
			.select(function (column) {
				var name = column.getName();
				var data = E.from(index)
					.zip(column.getValues(), function (index, value) {
						return [index, value];
					})
					.toArray();
				
				return {
					label: name,
					data: data,
				};
			})
			.toArray();
		
		$.plot(id, flotSeries);
	};
	
	// 
	// Create a simple data frame.
	//
	var values = [];
	for (var i = 0; i < 14; ++i) {
		values.push([i, Math.sin(i), Math.cos(i)]);
	}

	var dataFrame = new dataForge.DataFrame(["index", "Sin", "Cos"], values);
	
	//
	// Plot the data frame.
	//
	plot('#placeholder', "index", dataFrame);
});
