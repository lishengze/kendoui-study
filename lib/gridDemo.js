_ = require('underscore-plus')
// 属性信息展示模块
var gridOnedata = {title : '属性列表' }
var borderWidth = 6
var screenLeft = 587;
var toolbarHeight = 20.5
// var containerLeft = 0 ; //右侧呈现chart区域的left位置
// var containerHeight = 0 // window.innerHeight - 50
// var screenWidth = 0; //右侧呈现chart区域宽度

// containerLeft   右侧呈现chart区域的left位置
// containerHeight 右侧容器高度window.innerHeight - 50
// screenWidth  右侧呈现chart区域宽度
// MaxMinClickedTimes
// screenSelect  全局参数，表示选择的分屏个数
// times 选中属性的次数， 选中2次才生成chart
//var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
// zIndex   div的 zIndex值
// var screenSelect = 1 // 全局参数，表示选择的分屏个数
var templateModel = kendo.template("<strong style = 'color:indianred'>#: title #  </strong>\
                  <i  class = 'gridMax fa fa-clone'></i>\
                  <i  class = ' gridClose fa fa-times'></i>")
// var gridViewPointer.nodeQueue = [] // 存储选中的属性节点信息
// var gridViewPointer = null;
function setup(gridViewPointer) {
  // gridViewPointer.MaxMinClickedTimes = 0
  // gridViewPointer = gridViewPointers;
  gridViewPointer.zIndex = 1;
  gridViewPointer.MaxMinClickedTimes = 0;
  gridViewPointer.times = 0
  gridViewPointer.nodeQueue = [] // 存储选中的属性节点信息
  gridViewPointer.itemsArray = []
  gridViewPointer.screenSelect = 1; // 当前页面全局参数，表示选择的分屏个数
  var FourSplitScreenSelector = gridViewPointer.FourSplitScreen
  gridViewPointer.containerHeight = window.innerHeight - 50
  gridViewPointer.containerLeft = $(FourSplitScreenSelector).position().left + $(FourSplitScreenSelector).outerWidth() + 5;
  gridViewPointer.screenWidth = $('.baobiaoContainer').width() - gridViewPointer.containerLeft - 20
  window.configData = getConfigData();
  registerRtnObjectAttrTopic(gridViewPointer);
  initializeGrid(gridViewPointer);
  registerGridDataReceiveFunc(gridViewPointer);
  SplitScreen(gridViewPointer) // 分屏操作函数
  // SortDivHandler.Initialize(gridViewPointer);
  // // highcharts图表 resize操作
  // // $('#CPUUsageModel' + index).resizable({
  // //    // On resize, set the chart size to that of the
  // //    // resizer minus padding. If your chart has a lot of data or other
  // //    // content, the redrawing might be slow. In that case, we recommend
  // //    // that you use the 'stop' event instead of 'resize'.
  // //    resize: function() {
  // //        console.log($(this))
  // //        var chartNode = $(this).find('#CPUUsage' + index)
  // //        var chart = $(chartNode).highcharts()
  // //        console.log(chart)
  // //        chart.setSize(
  // //            $(this).width() - 20,
  // //            $(this).height() - 20,
  // //            false
  // //        );
  // //    }
  // });
}

function registerGridDataReceiveFunc(gridViewPointer) {
      var gridDataEventName = gridViewPointer.gridID;
      userApi.emitter.on(gridDataEventName, function(gridRspData){
          // console.log("gridDataEventName: " + gridDataEventName);
          var transGridData = transformGridData(gridRspData.rspData);
          var dataSource = new kendo.data.DataSource({data:transGridData});
          // console.log(gridNodeId)
          var gridSelector = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID));
          var grid = gridSelector.data("kendoGrid");
          grid.setDataSource(dataSource);
      })
}

function initializeGrid(gridViewPointer) { // 初始化 grid 属性列表 表格
  var gridID =  'gridOne' + gridViewPointer.gridID
  var gridHtml = "<div id= " + gridID + " class=\"gridOne AttrItem\"></div>"
  gridViewPointer.gridData.append(gridHtml);
  var gridSelector  = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID ));
  gridViewPointer.ChartItem = []; // grid表创建之后，建立一个 chart Item，存储属性值

  gridSelector.kendoGrid({
    scrollable: false,
    resizable: true,
    toolbar:  templateModel(gridOnedata),
    columns: [{
     field: '指标名称',
    }, {
     field: '指标ID',
    }
    ],
    change : function(e) {
      // console.log(gridViewPointer.gridID)
      gridViewPointer.times ++
      var selectedRows = this.select();
      // console.log(selectedRows)
      if( gridViewPointer.times % 2 === 1) {
        var selectedNode = null;
        var selectedText = $(selectedRows[0].parentNode)[0].lastChild.textContent; // 如果选中的为指标名称，自动转为指标ID
        var isItemHasBeenChoosen = false
        for(var i = 0; i < gridViewPointer.itemsArray.length; i ++){
          if(selectedText === gridViewPointer.itemsArray[i]){
            isItemHasBeenChoosen =  true
            break
          }
        }
        if(isItemHasBeenChoosen === false) {  // 如果该对象注册过，那么不再执行后面的注册函数,避免一个属性注册多次双击事件
          gridViewPointer.itemsArray.push(selectedText)
          selectedRows.dblclick(function(e) {
            var objectID = gridViewPointer.pageID;
            var HoldObjectID = selectedText;
            if (gridViewPointer.ChartItem[HoldObjectID] !== true) {
              initializeChart(gridViewPointer, HoldObjectID);
              reqQrySubscriberFunc(objectID, HoldObjectID);
              gridViewPointer.ChartItem[HoldObjectID] = true;
            }
            selectedNode = gridViewPointer.chartData.find($('#'+ selectedText + gridViewPointer.gridID + 'Model'))
            if($(selectedNode).is(':hidden') === true) { // 如果某一个属性打开过，又被关闭，那么再次打开执行显示操作
              $(selectedNode).show()
            }
            gridViewPointer.nodeQueue.unshift(selectedNode)
            // console.log(selectedNode)
            nodePosition(gridViewPointer,false)
            // eventProcess(selectedNode)
            // console.log('event')
            // SortDivHandler.Initialize();
          })
        }
      }
    },
    selectable: "multiple cell",
    sortable: true
  });
  // gridSelector.bind('change',  registerGridItemDblClickFunc(gridViewPointer))
  $(gridSelector).outerWidth($(gridViewPointer.FourSplitScreen).position().left +  $(gridViewPointer.FourSplitScreen).outerWidth())
  $(gridSelector).height(window.innerHeight - $(gridViewPointer.FourSplitScreen).offset().top - $(gridViewPointer.FourSplitScreen).outerHeight() - 20)
  // console.log($(gridSelector).css('z-index'))
  $(gridSelector).css('z-index', 0) // 左侧属性列表初始z-index 值设为 0
  containerLeft = $(gridSelector).width() + 15;
}

// function registerGridItemDblClickFunc(e, gridViewPointer) { // 生成选中的属性 对应的chart 对象
//   times ++
//   var selectedRows = this.select();
//   if( times % 2 === 1) {
//     var selectedNode = null;
//     var selectedText = $(selectedRows[0].parentNode)[0].lastChild.textContent; // 如果选中的为指标名称，自动转为指标ID
//     var isItemHasBeenChoosen = false
//     for(var i = 0; i < gridViewPointer.itemsArray.length; i ++){
//       if(selectedText === gridViewPointer.itemsArray[i]){
//         isItemHasBeenChoosen =  true
//         break
//       }
//     }
//     if(isItemHasBeenChoosen === false) {  // 如果该对象注册过，那么不再执行后面的注册函数,避免一个属性注册多次双击事件
//       gridViewPointer.itemsArray.push(selectedText)
//      // console.log($(selectedRows[0].parentNode)[0].lastChild.textContent)
//       selectedRows.dblclick(function(e) {
//         var objectID = gridViewPointer.pageID;
//         var HoldObjectID = selectedText;
//         if (gridViewPointer.ChartItem[HoldObjectID] !== true) {
//           initializeChart(gridViewPointer, HoldObjectID);
//           reqQrySubscriberFunc(gridViewPointer, objectID, HoldObjectID);
//           gridViewPointer.ChartItem[HoldObjectID] = true;
//         }
//         selectedNode = gridViewPointer.chartData.find($('#'+ selectedText + gridViewPointer.gridID + 'Model'))
//         gridViewPointer.nodeQueue.unshift(selectedNode)
//         // console.log(times)
//         //  console.log(gridViewPointer.nodeQueue)
//          console.log(gridViewPointer.screenSelect)
//          nodePosition(gridViewPointer,gridViewPointer.screenSelect)
//         // SortDivHandler.Initialize();
//       })
//     }
//   }
// }

function initializeChart(gridViewPointer,chartID) {
  var gridHtml = "<div id=\"" + chartID + gridViewPointer.gridID + "Model\" class=\" UsageModel AttrItem\">\
                  <div id=\"" + chartID + gridViewPointer.gridID + "Toolbar\" class=\" toolbar k-grid-toolbar\"></div>\
                  <div id=\"" + chartID + gridViewPointer.gridID + "\" class = 'highstockChart' ></div></div>"

  gridViewPointer.chartData.append(gridHtml);
  // console.log (gridViewPointer.chartData.html());

  var curChartSelector = $(gridViewPointer.chartData.find('#'+ chartID + gridViewPointer.gridID));
  var curChartModelSelector = $(gridViewPointer.chartData.find('#'+chartID + gridViewPointer.gridID+'Model'));
  var curChartToolbarSelector = $(gridViewPointer.chartData.find('#'+chartID + gridViewPointer.gridID+'Toolbar'));
  var highchartsToolbar = {title : chartID}
  curChartToolbarSelector.html(templateModel(highchartsToolbar));
  curChartSelector.css('z-index', 1)
  curChartSelector.highcharts('StockChart', {
    chart: {
      animation: false,
      marginTop: 0,
      zoomType: 'xy'
      },
      // height : window.innerHeight - 50,
      reflow: true,
      xAxis: {
        // enabled: true,
        // categories: []
        type: 'datetime'
      },
      rangeSelector: {
          enabled: false
      },
      yAxis: {
        max: 50, // 控制Y轴最大值，设成101是为了能显示100的grid
        min: 0, // 设定y轴最小值
        // minTickInterval: 0,
        // tickAmount: 6, // 控制y轴标线的个数
        // tickPixelInterval: 10, // 控制标线之间的中间间隔。
        title: {
          text: chartID
        },
        // allowDecimals: false, // 是否显示小数。
        opposite: false
      },
      scrollbar: {
        enabled: false
      },
      exporting: {
        enabled :false
      },
      credits: {
        enabled: false // 禁用版权信息
      },
      series: [{
            name: 'AttrValue',
            data: []
             }]
      })

  var chart = curChartSelector.highcharts();
  // chart.turboThreshold = 40000;
  // chart.setSize(curChartModelSelector.width(), curChartModelSelector.height() - toolbarHeight, false);
  // curChartModelSelector.hide();

  var updateTime = 1000;
  setChartData(gridViewPointer,curChartModelSelector, chart, chartID);
}

function setChartData(gridViewPointer, curChartModelSelector, chart, chartID) {
  var rtnDataName = gridViewPointer.pageID+'.'+chartID;
  var dataNumb = 0;
   gridViewPointer.aa = 1
  var chartDataAll = [];
  var nonRealTimeChartData = [];
  var RealTimeChartData = [];
  var curChartData;
  var testData = [];
  var testChartDataNumb = 0;

  var timeLimit = 10;
  var realTimeLine = 2;

  var isRealTime = false;
  var isFirstTime = true;

  var firstTime;
  var lastTime;
  var curTime;

  var lastActive = false;
  var curActive = false;
  var isItemTurnToActive = false;

  var updateFrequency = 500;
  var isNewDataCome = false;
  var curRtnData;
  userApi.emitter.on (rtnDataName, function(data){
    isNewDataCome = true;
    curRtnData = [tranTimeToUTC(data.MonDate, data.MonTime), parseFloat(data.AttrValue)];

    chartDataAll.push(curRtnData);

    testData.push(curRtnData);
    ++testChartDataNumb;

    if (true === isFirstTime) {
      lastTime = (new Date()).toTimeString().substring(0,8);
      firstTime = lastTime;
      isFirstTime = false;
    }

    curActive = window.displayItem[gridViewPointer.pageID];
    if (true !== lastActive && true === curActive) {
      isItemTurnToActive = true;
    } else {
      isItemTurnToActive = false;
    }
    lastActive = curActive;

    // if (true !== curActive) {
    //   console.log ('hide!');
    // }

    if (true === isRealTime) {

      if (true === curActive) {
        RealTimeChartData.push(curRtnData);
      }

      if (true === isItemTurnToActive) {
        RealTimeChartData = [];
      }

    } else {
      ++dataNumb;
      nonRealTimeChartData.push(curRtnData);

      curTime = (new Date()).toTimeString().substring(0,8);

      if ( MinusTime(curTime, lastTime) > realTimeLine ||
          MinusTime(curTime, firstTime) > timeLimit)  {

          isRealTime = true;
          if (true === curActive) {
            // console.log('++++SetData++++')

            curChartData = [];
            for (var i = 0; i < chartDataAll.length; ++i) {
              curChartData.push(chartDataAll[i]);
            }

            chart.series[0].setData(curChartData);
          }
      } else {
        lastTime = curTime;
      }
    }

  });

  setInterval(function() {
    if (true === isNewDataCome && true === curActive) {
      isNewDataCome = false;

      if ( true === isItemTurnToActive || false === isRealTime) {

        // console.log ('*** setInterval ***');

        curChartData = [];
        for (var i = 0; i < chartDataAll.length; ++i) {
          curChartData.push(chartDataAll[i]);
        }
        chart.series[0].setData(curChartData);

      } else {
        for (var i = 0; i < RealTimeChartData.length; ++i) {
          // console.log ('----addPoint----');
          addDataToChart(chart, RealTimeChartData[i]);
        }
        RealTimeChartData = [];
      }
    }
  }, updateFrequency)
}


function setChartData1(gridViewPointer,curChartModelSelector, chart, chartID) {
  var rtnDataName = gridViewPointer.pageID+'.'+chartID;
  var dataNumb = 0;
  var nonRealTimeChartData = [];
  var RealTimeChartData = [];

  var timeLimit = 10;
  var realTimeLine = 2;

  var isRealTime = false;
  var isFirstTime = true;

  var firstTime;
  var lastTime;
  var curTime;

  var updateFrequency = 500;
  var isNewDataCome = false;

  userApi.emitter.on (rtnDataName, function(data){

    isNewDataCome = true;

    if (true === isFirstTime) {
      lastTime = (new Date()).toTimeString().substring(0,8);
      firstTime = lastTime;
      isFirstTime = false;
    }

    if (true === isRealTime) {
      // console.log(data)
      // addDataToChart(chart , data);
      RealTimeChartData.push([tranTimeToUTC(data.MonDate, data.MonTime), parseFloat(data.AttrValue)]);
    } else {
      ++dataNumb;
      // console.log(data)
      nonRealTimeChartData.push([tranTimeToUTC(data.MonDate, data.MonTime), parseFloat(data.AttrValue)]);
      curTime = (new Date()).toTimeString().substring(0,8);

      if ( MinusTime(curTime, lastTime) > realTimeLine ||
           MinusTime(curTime, firstTime) > timeLimit)  {
          // console.log ('1: ' + lastTime);
          // console.log ('2: ' + curTime);
          // console.log ('dataNumb: ' + dataNumb);
          // console.log ('data.MonTime: ' + data.MonTime);
          // console.log(tranTimeToUTC(data.MonDate, data.MonTime));

          isRealTime = true;
          chart.series[0].setData(nonRealTimeChartData);
          // curChartModelSelector.show();
      } else {
        lastTime = curTime;
      }
    }

  });

  setInterval(function() {
    if (true === isNewDataCome ) {
      isNewDataCome = false;
      if ( false === isRealTime) {
        chart.series[0].setData(nonRealTimeChartData);
      } else {
        for (var i = 0; i < RealTimeChartData.length; ++i) {
          // console.log(chart)
          addDataToChart(chart, RealTimeChartData[i]);
        }
        // console.log(chart)
        RealTimeChartData = [];
      }
    }
  }, updateFrequency)
}

function tranTimeToUTC(dateString, timeString) {
  var dateArray = [];
  dateArray[0] = parseFloat(dateString.substring(0,4));
  dateArray[1] = parseFloat(dateString.substring(4,6));
  dateArray[2] = parseFloat(dateString.substring(6));

  var timeArray = timeString.split(':');
  for (var i = 0; i<timeArray.length; ++i) {
    timeArray[i] = parseFloat(timeArray[i]);
  }

  var utctime = Date.UTC(dateArray[0], dateArray[1], dateArray[2],
                        timeArray[0], timeArray[1], timeArray[2]);
  var dateArray = null
  return utctime;
}

function addDataToChart(chart, data) {
  var series = chart.series[0];
  series.addPoint(data, true, false);
}

function MinusTime(time1, time2) {
  var time1Array = time1.split(':');
  var time2Array = time2.split(':');

  if (time1Array.length !== time2Array.length) {
    return NaN;
  }

  for (var i = 0; i < time1Array.length; ++i) {
    time1Array[i] = parseInt(time1Array[i]);
    time2Array[i] = parseInt(time2Array[i]);
  }

  var result = (time1Array[0]*60+ time1Array[1])*60 + time1Array[2]
             - ((time2Array[0]*60+ time2Array[1])*60 + time2Array[2]);

  return result < 0 ? -result: result;
}

function getConfigData() { // 获取指标ID,配置数据
    var fs = require("fs");
    var jsContent = require("./system-config-utf8.json");

    // 访问方式originalAttrDataAttrDefine[i].$.propertyName.
    var originalAttrDataAttrDefine = jsContent.SystemConfig.AttrDefine[0].Attr;
    var transAttrData = [];

    for (var i= 0 ; i < originalAttrDataAttrDefine.length; ++i) {
        transAttrData[originalAttrDataAttrDefine[i].$.name] = {};
        transAttrData[originalAttrDataAttrDefine[i].$.name].name      = originalAttrDataAttrDefine[i].$.name;
        transAttrData[originalAttrDataAttrDefine[i].$.name].valueType = originalAttrDataAttrDefine[i].$.valueType;
        transAttrData[originalAttrDataAttrDefine[i].$.name].interval  = originalAttrDataAttrDefine[i].$.interval;
        transAttrData[originalAttrDataAttrDefine[i].$.name].comment   = originalAttrDataAttrDefine[i].$.comment;
    }

    // console.log ('AttrDefine property numb: ' + originalAttrDataAttrDefine.length);
    // console.log (originalAttrDataAttrDefine[1].$.name)
    // console.log(transAttrData[originalAttrDataAttrDefine[1].$.name])

    var originalAttrDataPerformance = jsContent.SystemConfig.PerformanceAttrs[0].Attr;
    for (i = 0 ; i < originalAttrDataPerformance.length; ++i) {
        transAttrData[originalAttrDataPerformance[i].$.name] = {};
        transAttrData[originalAttrDataPerformance[i].$.name].name      = originalAttrDataPerformance[i].$.name;
        transAttrData[originalAttrDataPerformance[i].$.name].valueType = originalAttrDataPerformance[i].$.valueType;
        transAttrData[originalAttrDataPerformance[i].$.name].interval  = originalAttrDataPerformance[i].$.interval;
        transAttrData[originalAttrDataPerformance[i].$.name].comment   = originalAttrDataPerformance[i].$.comment;
    }

    // console.log ('Performance property numb: ' + originalAttrDataPerformance.length);
    // console.log (originalAttrDataPerformance[1].$.name)
    // console.log(transAttrData[originalAttrDataPerformance[1].$.name])
    return transAttrData;
}

function transformGridData(originalData) { // 根据XML文件映射关系,通过指标ID 获取指标名称
    var transData = [];
    var tmpItem = {};
    for (var tmpindex = 0; tmpindex < originalData.length; ++tmpindex) {
      if (configData[originalData[tmpindex].HoldObjectID] !== undefined) {
        tmpItem = {
          '指标名称': configData[originalData[tmpindex].HoldObjectID].comment,
          '指标ID' : originalData[tmpindex].HoldObjectID
        }
        transData.push(tmpItem);
      } else {
        console.log(originalData[tmpindex].HoldObjectID);
      }
    }

    return transData;
}
/*
注册实时回调监听函数，只注册一次。
回调数据中的ObjectID，AttrType标记不同的请求。
在接受到数据后，以ObjectID+AttrType为名将数据发送到对应请求注册的监听接口中。
*/
function registerRtnObjectAttrTopic() {
  if (window.registerRtnObjectAttrTopic === false) {
    userApi.emitter.on(EVENTS.RtnObjectAttrTopic, function(data){
      var curRtnMessageName = data.ObjectID + '.' + data.AttrType;
      userApi.emitter.emit(curRtnMessageName, data);
    });
    window.registerRtnObjectAttrTopic = true;
  }
}

function reqQrySubscriberFunc(objectID, attrType){ // 注册订阅信息
  var reqQrySubscriberData = new userApiStruct.CShfeFtdcReqQrySubscriberField();
  reqQrySubscriberData.ObjectID  = objectID+'.'+attrType;
  reqQrySubscriberData.ObjectNum = -1;
  reqQrySubscriberData.KeepAlive = 1;
  var reqQrySubscriberField = {}
  reqQrySubscriberField.reqObject  = reqQrySubscriberData;
  reqQrySubscriberField.RequestId  = ++window.ReqQrySubscriberTopicRequestID;
  reqQrySubscriberField.rtnMessage = reqQrySubscriberData.ObjectID;

  // registerRtnObjectAttrObjectID(reqQrySubscriberField.rtnMessage);

  userApi.emitter.emit(EVENTS.ReqQrySubscriberTopic, reqQrySubscriberField);
}

function nodePosition(gridViewPointer, isKeepVisable) { // 根据分屏要求，确定对象位置；isKeepVisable 表示，如果是isKeepVisable 保持节点原本的显示属性
  // console.log(gridViewPointer.gridID)
  if(gridViewPointer.screenSelect <= 0 || gridViewPointer.screenSelect > 4) return
  if(gridViewPointer.screenSelect < 4 && gridViewPointer.screenSelect > 0) {
    for(var th = 0; th < gridViewPointer.screenSelect; th ++) {
      var node = gridViewPointer.nodeQueue[th]
      if(true === $(node).hasClass('UsageModel')) {
        $(node).css({'top' : gridViewPointer.containerHeight* th / gridViewPointer.screenSelect + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth + borderWidth, 'height' : gridViewPointer.containerHeight/ gridViewPointer.screenSelect + borderWidth - 15})
        var chart = $(node).find('.highstockChart').highcharts()
        chart.setSize($(node).width() , $(node).height() - toolbarHeight, false );
      } else {
        $(node).css({'top' : gridViewPointer.containerHeight* th / gridViewPointer.screenSelect + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth, 'height' : gridViewPointer.containerHeight/ gridViewPointer.screenSelect - 15})
      }
    }
  } else if (gridViewPointer.screenSelect === 4) {
   var node = gridViewPointer.nodeQueue[0]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).css({'top' : 0 + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth / 2 + borderWidth - 15, 'height' : gridViewPointer.containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
   } else {
     $(node).css({'top' : 0 + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth / 2 - 15 , 'height' : gridViewPointer.containerHeight / 2 - 15})
   }
   var node = gridViewPointer.nodeQueue[1]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).css({'top' : 0 + 5, 'left' : gridViewPointer.containerLeft + gridViewPointer.screenWidth / 2 - 5, 'width' : gridViewPointer.screenWidth / 2 + borderWidth - 15, 'height' : gridViewPointer.containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
   } else {
     $(node).css({'top' : 0 + 5, 'left' : gridViewPointer.containerLeft + gridViewPointer.screenWidth / 2 - 5, 'width' : gridViewPointer.screenWidth / 2 - 15, 'height' : gridViewPointer.containerHeight / 2 - 15})
   }
   var node = gridViewPointer.nodeQueue[2]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).css({'top' : gridViewPointer.containerHeight / 2 + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth / 2 + borderWidth - 15, 'height' : gridViewPointer.containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
   } else {
     $(node).css({'top' : gridViewPointer.containerHeight / 2 + 5, 'left' : gridViewPointer.containerLeft, 'width' : gridViewPointer.screenWidth / 2 - 15, 'height' : gridViewPointer.containerHeight / 2 - 15})
   }
   var node = gridViewPointer.nodeQueue[3]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).css({'top' : gridViewPointer.containerHeight / 2 + 5, 'left' : gridViewPointer.containerLeft + gridViewPointer.screenWidth / 2 - 5, 'width' : gridViewPointer.screenWidth / 2 + borderWidth - 15, 'height' : gridViewPointer.containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
   } else {
     $(node).css({'top' : gridViewPointer.containerHeight / 2 + 5, 'left' : gridViewPointer.containerLeft + gridViewPointer.screenWidth / 2 - 5, 'width' : gridViewPointer.screenWidth / 2 - 15, 'height' : gridViewPointer.containerHeight / 2 - 15})
   }
  }
  if(isKeepVisable === false) {
    // 将不展示的属性隐藏
    // 方法为： 将数组中 gridViewPointer.screenSelect之后的 属性全部隐藏。
    // 再将前 gridViewPointer.screenSelect 个数据展示出来 这样可以避免前后相同的数据被隐藏
    // 如 [A,B,C,D,A] gridViewPointer.screenSelect为 4
    for(var i = gridViewPointer.screenSelect; i < gridViewPointer.nodeQueue.length; i ++) {
      $(gridViewPointer.nodeQueue[i]).hide()
    }
    for(var j = 0; j < gridViewPointer.screenSelect; j++) {
      $(gridViewPointer.nodeQueue[j]).show()
    }
  }

//  for(var i = num; i < gridViewPointer.nodeQueue.length; i ++) {
//    var flag = 0
//    for(var j = 0; j <num; j++) {
//      if(gridViewPointer.nodeQueue[i] === gridViewPointer.nodeQueue[j]) {
//        flag = 1
//        break
//      }
//    }
//    if(flag !== 1) {
//      console.log(gridViewPointer.nodeQueue[i])
//      $(gridViewPointer.nodeQueue[i]).hide()
//    }
//  }
}
function SplitScreen(gridViewPointer) { //分屏操作
  $(gridViewPointer.ASplitScreen).click(function(e){
    console.log(gridViewPointer.gridID)
    gridViewPointer.screenSelect = 1
    nodePosition(gridViewPointer,true)
  })
  $(gridViewPointer.BinaryScreen).click(function(e){
    console.log(gridViewPointer.gridID)
    gridViewPointer.screenSelect = 2
    nodePosition(gridViewPointer,true)
  })
  $(gridViewPointer.ThreeSplitScreen).click(function(e){
    gridViewPointer.screenSelect = 3
    nodePosition(gridViewPointer,true)
  })
  $(gridViewPointer.FourSplitScreen).click(function(e){
    console.log(gridViewPointer.gridID)
    gridViewPointer.screenSelect = 4
    nodePosition(gridViewPointer,true)
  })
  // $('.SplitScreenBtn').click(function(e) {
  //   console.log($(this))
  //   // console.log('BinaryScreen' + gridViewPointer.gridID)
  //   console.log(this.id === 'BinaryScreen' + gridViewPointer.gridID)
  //   if(this.id === 'BinaryScreen' + gridViewPointer.gridID) {
  //     screenSelect = 2
  //     nodePosition(screenSelect)
  //   } else if(this.id === 'ThreeSplitScreen' + gridViewPointer.gridID) {
  //     screenSelect = 3
  //     nodePosition(screenSelect)
  //   } else if(this.id === 'FourSplitScreen' + gridViewPointer.gridID) {
  //     screenSelect = 4
  //     nodePosition(screenSelect)
  //   } else {
  //     screenSelect = 1
  //     nodePosition(screenSelect)
  //   }
  // })
}
var SortDivHandler = {
  CurrentLocationX: 0,
  CurrentLocationY: 0,
  CurrentSortFlag: 0,
  CurrentSortDiv: null,
  CurrentZindex: 0,
  CurrentSortMove: 0,
  Initialize: function(gridViewPointer) {
    var isStart = false;
    var isDrag = true;
    $(gridViewPointer).delegate('.k-grid-toolbar','mousedown',function(e) {
      console.log($(this))
      var SortTarget = $(this).parent();
      SortDivHandler.CurrentSortMove = 0;
      SortDivHandler.CurrentSortDiv = $(this);
      SortDivHandler.CurrentZindex = $(this).parents('.AttrItem').css('z-index')
      isDrag = true;
      SortDivHandler.CurrentLocationX = SortTarget.position().left;
      SortDivHandler.CurrentLocationY = SortTarget.position().top;
      SortTarget.attr("drag", 1);
      var currentTarget = SortTarget;
      var currentDisX = e.pageX - $(this).offset().left;
      var currentDisY = e.pageY - $(this).offset().top;
      $(document).mousemove(function(event) {
        // console.log('move in down')
        // console.log('drag : ' + $(currentTarget).attr("drag")3
        // console.log('value : ' + SortDivHandler.CurrentSortMove)
        if ($(currentTarget).attr("drag") == 0 || SortDivHandler.CurrentSortMove == 1) return;
        SortDivHandler.CurrentSortDiv.parent().css("z-index", 0 ).css("opacity", 0.6);
        var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() - $('.tree-view-resize-handle').width()/2 // left 位置
        var currentX = event.clientX;
        var currentY = event.clientY;
        var cursorX = event.pageX - currentDisX - nodeLeft - parseFloat($('.pane').css('padding-left')); // $(this).offset().left;
        var cursorY = event.pageY - currentDisY - $('.tab-bar').height() - parseFloat($('.pane').css('padding-top')); //-$(this).offset().top;
        $(currentTarget).css("top", cursorY  + "px").css("left", cursorX + "px");
        // console.log('isStart is true')
        isStart = true;
      });
      $(document).mouseup(function() {
        // if(isDrag==false)return;
        $(currentTarget).attr("drag", 0);
        $(currentTarget).css("opacity", 1).css('z-index', SortDivHandler.CurrentZindex);
      });
    })
    $('.baobiaoContainer').delegate(".k-grid-toolbar",'mousemove',function() {
      // console.log($(this).parent().attr("id"))
      var thisParent = $(this).parent()
      if (isStart == false) return;
      // console.log(thisParent.attr('class'))
      // console.log(thisParent.hasClass('gridOne'))
          // if (SortDivHandler.CurrentSortFlag == 0) {
      if (thisParent.attr("id") == SortDivHandler.CurrentSortDiv.parent().attr("id") ||
          thisParent.hasClass('gridOne') ||
          SortDivHandler.CurrentSortDiv.parent().hasClass('gridOne')) {
        // console.log('same id')
        return;
      } else {
        if (SortDivHandler.CurrentSortMove == 1) return;
        // console.log(SortDivHandler)
        SortDivHandler.CurrentSortMove = 1;
        var targetX = thisParent.position().left;
        var targetY = thisParent.position().top;
        SortDivHandler.CurrentSortDiv.parent().stop(true).animate({
          left: targetX  + "px",
          top: targetY + "px"
        }, 500, function() {
          // console.log(SortDivHandler.CurrentSortDiv.parent().css('left'))
          $(this).css("opacity", 1).css('z-index', SortDivHandler.CurrentZindex);
        });
        $(this).parent().stop(true).animate({
          left: SortDivHandler.CurrentLocationX  + "px",
          top: SortDivHandler.CurrentLocationY  + "px"
        }, 300, function() {});
        isDrag = false;
      }
      // }
    });
    $('.baobiaoContainer').delegate(".k-grid-toolbar",'mouseup',function() {
      if (isDrag == false) return;
      SortDivHandler.CurrentSortMove = 1;
    });
  }
}
function eventProcess(selectedNode) { //事件操作
  // SortDivHandler.Initialize() // 带有div位置交换的 鼠标移动操作
  // mouseEventProcess() //鼠标移动操作
  clickEventProcess(selectedNode)
}
function mouseEventProcess() {
   //// 鼠标拖拽操作
  var dragging = false
  var node = null
  $(".k-grid-toolbar").mousedown(function(e) {
    dragging = true
    node = $(this).parent()
    console.log(node)
    // var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() -$('.tree-view-resize-handle').width()/2
    $(node).css('z-index', ++ gridViewPointer.zIndex)
    iDiffX = e.pageX - $(this).offset().left
    iDiffY = e.pageY - $(this).offset().top
    return false
  })
  document.onmousemove = function(e) {
    if (dragging) {
      var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() - $('.tree-view-resize-handle').width()/2 // left 位置
      var e = e || window.event;
      $(node).css({ "left": (e.pageX - iDiffX  - nodeLeft), "top": (e.pageY - iDiffY - $('.tab-bar').height()) })
      return false;
    }
  }
  $(document).mouseup(function (e) {
    dragging = false
  })
}
// function clickEventProcess() {
//   // var nodeCurPosition = []
//   // document.onclick = function(e) { //将鼠标点击的属性对象放置最上层
//   //   $(e.target).parents('.AttrItem').css('z-index',  ++ zIndex)
//   // }
//   $(selectedNode).find('.gridClose').click(function(e) { //关闭
//     console.log($(this).parent().parent())
//     var node = $(this).parent().parent()
//     $(node).hide()
//   })
//   $('.baobiaoContainer').delegate('.k-grid-toolbar','dblclick', function(nodeCurPosition) { //toolbar 双击操作
//     gridViewPointer.MaxMinClickedTimes ++
//     // console.log('dblclick')
//     var node = $(this).parent()
//     console.log(node)
//     resizeNode(node)
//   })
//   $(selectedNode).find('.gridMax').click(function(nodeCurPosition) { //放大缩小
//     gridViewPointer.MaxMinClickedTimes ++
//     var node = $(this).parent().parent()
//     resizeNode(gridViewPointer,node)
//   })
// }
function windowResizeEvent(currentGridViewPointer) {
   /* 每次打开一个tab页，都会注册resize监听函数，当 window 大小重置时，所有页面都会执行resize操作
     当执行resize操作时，要重新计算属性列表的长宽。而测试发现，非当前页面的FourSplitScreen button position值为 0
     因此想到，执行非当前页面的属性列表长宽都 button 类 数组对象 中 position().left 最大的数据
  */
  // $(window).resize(function(){
  //   // console.log(gridViewPointer.gridID)
  //   // console.log($(FourSplitScreen))
  //   console.log($('.FourSplitScreenBtn'))
  //   var gridSelector  = $(currentGridViewPointer.gridData.find('#gridOne' + currentGridViewPointer.gridID ));
  //   $(gridSelector).outerWidth($('.FourSplitScreenBtn').position().left +  $('.FourSplitScreenBtn').outerWidth())
  //   $(gridSelector).height(window.innerHeight - $('.FourSplitScreenBtn').offset().top - $('.FourSplitScreenBtn').outerHeight() - 20)
  //   // console.log($(FourSplitScreen).width())
  //   console.log($('.FourSplitScreenBtn').offset())
  //   // console.log( $(gridSelector).outerWidth())
  //   containerHeight = window.innerHeight - 50
  //   // console.log(currentContainerHeight)
  //   containerLeft = $('.FourSplitScreenBtn').position().left + $('.FourSplitScreenBtn').outerWidth() + 5;
  //   screenWidth = $('.baobiaoContainer').width() - containerLeft - 20
  //   nodePosition(currentGridViewPointer,screenSelect)
  // })
}
function resizeNode(gridViewPointer,node) {
  // var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
  var nodeMaxWidth = $('.baobiaoContainer').width() - 10
  var nodeMaxHeight = window.innerHeight - 50
  var nodeRight = window.pageYOffset + $('.tab-bar').height()
  $(node).css('z-index', ++ gridViewPointer.zIndex)
  if (gridViewPointer.MaxMinClickedTimes % 2 === 1 ) { // 保存当前的位置和长宽
    nodeCurPosition =  $(node).position()
    nodeWidth = $(node).width()
    nodeHeight = $(node).height()
    gridViewPointer.isResize = false
  }
  console.log(gridViewPointer.isResize)
  if (nodeMaxWidth !==  $(node).width()) { //最大化
    // console.log('最大化')
    $(node).css({ "left": 0, "top": 0 })
    $(node).width(nodeMaxWidth)
    $(node).height(nodeMaxHeight)
    if (true === $(node[0]).hasClass('UsageModel')) {
      var chart =$(node[0]).find('.highstockChart').highcharts()
      chart.setSize(nodeMaxWidth , nodeMaxHeight - toolbarHeight, false );
    }
  } else {// 还原
     $(node).css({ "left": nodeCurPosition.left, "top": nodeCurPosition.top })
     $(node).width(nodeWidth)
     $(node).height(nodeHeight)
     if (true === $(node[0]).hasClass('UsageModel')) {
       var chart = $(node[0]).find('.highstockChart').highcharts()
       chart.setSize(nodeWidth, nodeHeight - toolbarHeight , false );
     }
  }
}
// var SortDivHandler = {
//   CurrentLocationX: 0,
//   CurrentLocationY: 0,
//   CurrentSortFlag: 0,
//   CurrentSortDiv: null,
//   CurrentZindex: 0,
//   CurrentSortMove: 0,
//   Initialize: function() {
//     var isStart = false;
//     var isDrag = false;
//     var currentTarget = null;
//     var currentDisX = 0;
//     var currentDisY = 0;
//     var HandlerParent = null;
//     $('.k-grid-toolbar').mousedown(function(e) {
//       var SortTarget = $(this).parent();
//       SortDivHandler.CurrentSortMove = 0;
//       SortDivHandler.CurrentSortDiv = $(this).parent();
//       SortDivHandler.CurrentZindex = $(this).parents('.AttrItem').css('z-index')
//       isDrag = true;
//       SortDivHandler.CurrentLocationX = SortTarget.position().left;
//       SortDivHandler.CurrentLocationY = SortTarget.position().top;
//       SortTarget.attr("drag", 1);
//       currentTarget = SortTarget;
//       currentDisX = e.pageX - $(this).offset().left;
//       currentDisY = e.pageY - $(this).offset().top;
//     })
//     $(document).mousemove(function(event) {
//       if(isDrag) {
//         console.log('move in down')
//         // console.log(currentTarget)
//         // console.log('drag : ' + $(currentTarget).attr("drag"))
//         // console.log('value : ' + SortDivHandler.CurrentSortMove)
//         if ($(currentTarget).attr("drag") == 0 || SortDivHandler.CurrentSortMove == 1) return;
//         // if(SortDivHandler.CurrentSortDiv.hasClass('gridOne') === false) //若为属性列表，则zindex不变
//         SortDivHandler.CurrentSortDiv.css("z-index", 0).css("opacity", 0.6);
//         var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() - $('.tree-view-resize-handle').width()/2 // left 位置
//         var currentX = event.clientX;
//         var currentY = event.clientY;
//         var cursorX = event.pageX - currentDisX; // $(this).offset().left;
//         var cursorY = event.pageY - currentDisY; //-$(this).offset().top;
//         $(currentTarget).css("top", cursorY - $('.tab-bar').height() - 3 + "px").css("left", cursorX - nodeLeft + "px");
//         // console.log('isStart is true')
//         isStart = true;
//       }
//     });
//     // $(document).mouseup(function() {
//     //   // if(isDrag==false)return;
//     //   $(currentTarget).attr("drag", 0);
//     //   $(currentTarget).css("opacity", 1).css('z-index', SortDivHandler.CurrentZindex);
//     // });
//   $(".k-grid-toolbar").mousemove(function() {
//       // console.log($(this).parent().attr("id"))
//       var thisParent = $(this).parent()
//       // console.log(thisParent)
//       if (isStart == false) return;
//           // if (SortDivHandler.CurrentSortFlag == 0) {
//       if (thisParent.attr("id") == SortDivHandler.CurrentSortDiv.attr("id")) {
//         // console.log('same id')
//         return;
//       } else {
//         if (SortDivHandler.CurrentSortMove == 1) return;
//         // console.log(SortDivHandler)
//         SortDivHandler.CurrentSortMove = 1;
//         var targetX = thisParent.position().left;
//         var targetY = thisParent.position().top;
//         SortDivHandler.CurrentSortDiv.stop(true).animate({
//           left: targetX  + "px",
//           top: targetY + "px"
//         }, 500, function() {
//           // console.log(SortDivHandler.CurrentSortDiv.parent().css('left'))
//           $(this).css("opacity", 1).css('z-index', SortDivHandler.CurrentZindex);
//         });
//         $(this).parent().stop(true).animate({
//           left: SortDivHandler.CurrentLocationX  + "px",
//           top: SortDivHandler.CurrentLocationY  + "px"
//         }, 300, function() {});
//         isDrag = false;
//       }
//       // }
//     });
//
//     $(document).mouseup(function() {
//       $(currentTarget).attr("drag", 0);
//       $(currentTarget).css("opacity", 1).css('z-index', SortDivHandler.CurrentZindex);
//       if (isDrag == false) return;
//       SortDivHandler.CurrentSortMove = 1;
//     });
//   }
// }

function initialDataGenerator() { // 构建初始随机值
  var Mydata = []
  var time = (new Date()).getTime()
  var i
  for (i = -1002; i <= 0; i += 1) {
    Mydata.push([
      time + i * 1000,
      Math.ceil(Math.random() * 100)
    ])
  }
  return Mydata
}
module.exports.setup = setup
module.exports.nodePosition = nodePosition
module.exports.resizeNode = resizeNode
