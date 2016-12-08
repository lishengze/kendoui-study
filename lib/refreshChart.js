function ChartDataStruct(){
  this.isNewDataCome = false;
  this.callbackDataForSet = [];
  this.callbakcDataForAdd = [];
	this.chart = null;
}

window.g_chartDataStruct = ChartDataStruct;
window.g_GlobalChart = []; // 每次建立图表时，便可记录
window.g_ChartConfig = {
	addDataNumbLimit: 5,
	updateFrequency: 1000
}

function RefreshChart ()
{
  setInterval(function() {
	for (pageID in g_GlobalChart)
	{
	  if (true === window.displayItem[pageID])
		{
			// console.log ('pageID: ' + pageID);
			for (charID in g_GlobalChart[pageID] )
			{
				var curChart = g_GlobalChart[pageID][charID];
				if (true === curChart.isNewDataCome)
				{
					curChart.isNewDataCome = false;
					if (curChart.callbakcDataForAdd.length > g_ChartConfig.addDataNumbLimit)
					{

						var curChartData = [];
						for (var i = 0; i < curChart.callbackDataForSet.length; ++i)
						{
							curChartData.push(curChart.callbackDataForSet[i]);
						}
						curChart.chart.series[0].setData(curChartData);
						// console.log (pageID + '.' + charID + ': ' + curChart.callbakcDataForAdd.length);
						curChart.callbakcDataForAdd = [];
					}
					else
					{
						for (var i = 0; i < curChart.callbakcDataForAdd.length; ++i)
						{
							curChart.chart.series[0].addPoint(curChart.callbakcDataForAdd[i], true, false);
						}
						curChart.callbakcDataForAdd = [];
					}
				}
			}
		}
	}
  }, g_ChartConfig.updateFrequency)
}

exports.RefreshChart = RefreshChart;
