_ = require('underscore-plus')
// 属性信息展示模块
var gridOnedata = {title : '属性列表' }
var containerLeft = 0 ; //右侧呈现chart区域的left位置
var screenLeft = 587;
var screenWidth = 0; //$('.baobiaoContainer').width() - containerLeft - 20
var borderWidth = 6
var containerHeight = 0 // window.innerHeight - 50
var toolbarHeight = 20.5
var times = 0;
var MaxMinClickedTimes = 0;
//var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
var zIndex = 0 // div的 zIndex值
var screenSelect = 1 // 全局参数，表示选择的分屏个数
var templateModel = kendo.template("<strong style = 'color:indianred'>#: title #  </strong>\
                  <i  class = 'gridMax fa fa-clone'></i>\
                  <i  class = ' gridClose fa fa-times'></i>")
var nodeQueue = [] // 存储选中的属性节点信息
var gridViewPointer = null;
function setup(gridViewPointers) {
  gridViewPointer = gridViewPointers;
  containerHeight = window.innerHeight - 50
  containerLeft = $('#FourSplitScreen' + gridViewPointer.gridID).position().left + $('#FourSplitScreen'+ gridViewPointer.gridID).outerWidth() + 5;
  screenWidth = $('.baobiaoContainer').width() - containerLeft - 20
  window.configData = getConfigData();
  registerRtnObjectAttrTopic();
  registerGridDataReceiveFunc(gridViewPointer);
  initializeGrid(gridViewPointer);
  SplitScreen() // 分屏操作函数
  windowResizeEvent(); //窗口大小变化操作

  // SortDivHandler.Initialize();
  //
  // mouseEventProcess();
  // containerHeight = window.innerHeight - 50
  // $('#gridOne' + gridViewPointer.gridID).outerWidth($('#FourSplitScreen' + gridViewPointer.gridID).position().left +  $('#FourSplitScreen' + gridViewPointer.gridID).outerWidth() - borderWidth)
  // $('#gridOne' + gridViewPointer.gridID).height(window.innerHeight -  $('#FourSplitScreen'+ gridViewPointer.gridID).outerHeight() - 100)
  // $(window).resize(function() {// 根据窗口大小自动调整treeview窗口高度
  //  //process here
  //   windowHeight = window.innerHeight
  //   var resizeHeight = windowHeight -  $('#FourSplitScreen' + gridViewPointer.gridID).outerHeight() -100
  //   $('#gridOne' + gridViewPointer.gridID).outerWidth($('#FourSplitScreen' + gridViewPointer.gridID).position().left +  $('#FourSplitScreen' + gridViewPointer.gridID).outerWidth() - borderWidth)
  //   $('#gridOne' + gridViewPointer.gridID).height(resizeHeight)// 设置treeview窗口的高度
  // });
  // var gridOnedata = {title : '属性列表' }
  // var indexData =  [{'指标名称':'对象是否活跃标示','指标ID':'Active'},
  //         {'指标名称':'日志事件','指标ID':'SyslogEvent'},
  //         {'指标名称':'已处理告警事件','指标ID':'ProcessedEvent'},
  //         {'指标名称':'业务进程所在文件系统使用率','指标ID':'DisUsage'},
  //         {'指标名称':'业务进程CPU使用率','指标ID':'CPUUsage'},
  //         {'指标名称':'未处理告警事件','指标ID':'UnprocessdEvent'}]
  //
  // $('#gridOne' + index).kendoGrid({
  //   scrollable: false,
  //   resizable: true,
  //   toolbar:  templateModel(gridOnedata),
  //   columns: [{
  //    field: '指标名称',
  //   }, {
  //    field: '指标ID',
  //   }
  //   ],
  //   selectable: "multiple cell",
  //   sortable: true,
  //   dataSource: indexData
  // })
  // CreateAttrObjects(index) // 生成各个属性对象
  // var times = 0;
  // $('.gridOne td').dblclick(function(e) { //属性选择操作
  //   times ++; // 因为dbclick 相当于执行了两次，所以我们需要
  //   if( times % 2 === 1) {
  //     var selectedRows = $(e.target);
  //     console.log(selectedRows)
  //     switch (selectedRows[0].textContent) {
  //       case '日志事件':
  //       case 'SyslogEvent':
  //         $('#rizhi' + index).show().css('z-index', ++ zIndex)// zIndex解决 切换属性时的覆盖问题
  //         nodeQueue.unshift($('#rizhi' +index))
  //         nodePosition(screenSelect)
  //         // console.log(nodeQueue)
  //         break
  //       case '业务进程所在文件系统使用率':
  //       case 'DisUsage':
  //         $('#DisUsageModel' + index).show().css('z-index', ++ zIndex)
  //         nodeQueue.unshift($('#DisUsageModel' + index))
  //         nodePosition(screenSelect)
  //         break
  //       case '业务进程CPU使用率':
  //       case 'CPUUsage':
  //         $('#CPUUsageModel' + index).show().css('z-index', ++ zIndex)
  //         nodeQueue.unshift($('#CPUUsageModel' + index))
  //         nodePosition(screenSelect)
  //         break
  //       case '未处理告警事件':
  //       case 'UnprocessdEvent':
  //         $('#TestUsageModel' + index).show().css('z-index', ++ zIndex)
  //         nodeQueue.unshift($('#TestUsageModel' + index))
  //         nodePosition(screenSelect)
  //         break
  //       default:
  //     }
  //   }  else {}
  //   console.log()
  // })
  // // 鼠标响应事件
  // // 记录节点的大小和位置信息
  // var nodeWidth  = 0
  // var nodeHeight = 0
  // var nodePosition = {}
  // var i = 0
  // // var chartNode =  $('#CPUUsage').parents('baobiaoContainer').find('#CPUUsage')
  // // var chart = $('#CPUUsage').highcharts()
  // // console.log(chart)
  // function resizeWindow(node) {
  //   // var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
  //   console.log(toolbarHeight);
  //   var nodeMaxWidth = $('.baobiaoContainer').width() - 10
  //   var nodeMaxHeight = window.innerHeight - 50
  //   var nodeRight = window.pageYOffset + $('.tab-bar').height()
  //   $(node).css('z-index', ++ zIndex)
  //   if (i % 2 === 1) { // 保存当前的位置和长宽
  //     nodePosition =  $(node).position()
  //     nodeWidth = $(node).width()
  //     nodeHeight = $(node).height()
  //   }
  //   if (nodeMaxWidth !==  $(node).width()) { //最大化
  //     $(node).css({ "left": 0, "top": 0 })
  //     $(node).width(nodeMaxWidth)
  //     $(node).height(nodeMaxHeight)
  //     if (true === $(node[0]).hasClass('UsageModel')) {
  //       var chart =$(node[0]).find('.highstockChart').highcharts()
  //       chart.setSize(nodeMaxWidth , nodeMaxHeight - toolbarHeight, false );
  //     }
  //   } else {// 还原
  //      $(node).css({ "left": nodePosition.left, "top": nodePosition.top })
  //      $(node).width(nodeWidth)
  //      $(node).height(nodeHeight)
  //      if (true === $(node[0]).hasClass('UsageModel')) {
  //        var chart = $(node[0]).find('.highstockChart').highcharts()
  //        chart.setSize(nodeWidth, nodeHeight - toolbarHeight , false );
  //        console.log(toolbarHeight)
  //      }
  //   }
  // }
  // $('.k-grid-toolbar').dblclick(function(e) { //toolbar 双击操作
  //   i ++
  //   var node = $(this).parent()
  //   resizeWindow(node)
  // })
  // $('.gridClose').click(function(e) { //关闭
  //   var node = $(this).parent().parent()
  //   $(node).hide()
  // })
  // $('.gridMax').click(function(e) { //放大缩小
  //   i ++
  //   var node = $(this).parent().parent()
  //   console.log(node)
  //   resizeWindow(node)
  // })
  // document.onclick = function(e) { //将鼠标点击的属性对象放置最上层
  //   $(e.target).parents('.AttrItem').css('z-index',  ++ zIndex)
  // }
  // $('.SplitScreenBtn').click(function(e) {
  //   if(this.id === 'BinaryScreen' + index) {
  //     screenSelect = 2
  //     nodePosition(screenSelect)
  //   } else if(this.id === 'ThreeSplitScreen' + index) {
  //     screenSelect = 3
  //     nodePosition(screenSelect)
  //   } else if(this.id === 'FourSplitScreen' + index) {
  //     screenSelect = 4
  //     nodePosition(screenSelect)
  //   } else {
  //     screenSelect = 1
  //     nodePosition(screenSelect)
  //   }
  // })
  //  // 鼠标拖拽操作
  // // var dragging = false
  // // var node
  // // $(".k-grid-toolbar").mousedown(function(e) {
  // //   dragging = true
  // //   node = $(this).parent()
  // //   // var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() -$('.tree-view-resize-handle').width()/2
  // //   $(node).css('z-index', ++ zIndex)
  // //   iDiffX = e.pageX - $(this).offset().left
  // //   iDiffY = e.pageY - $(this).offset().top
  // //   return false
  // // })
  // // document.onmousemove = function(e) {
  // //   if (dragging) {
  // //     var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() - $('.tree-view-resize-handle').width()/2 // left 位置
  // //     var e = e || window.event;
  // //     $(node).css({ "left": (e.pageX - iDiffX  - nodeLeft), "top": (e.pageY - iDiffY - $('.tab-bar').height()) })
  // //     return false;
  // //   }
  // // }
  // // $(document).mouseup(function (e) {
  // //   dragging = false
  // // })
  // SortDivHandler.Initialize();
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
          console.log("gridDataEventName: " + gridDataEventName);
          var transGridData = transformGridData(gridRspData.rspData);
          var dataSource = new kendo.data.DataSource({data:transGridData});

          var gridNodeId = 'gridOne' + gridViewPointer.gridID
          // console.log(gridNodeId)
          var gridSelector = $(gridViewPointer.gridData.find('#'+gridNodeId));
          var grid = gridSelector.data("kendoGrid");
          grid.setDataSource(dataSource);
      })
}

function initializeGrid(gridViewPointer) {
  var gridID =  'gridOne' + gridViewPointer.gridID
  var gridHtml = "<div id= " + gridID + " class=\"gridOne AttrItem\"></div>"
  gridViewPointer.gridData.append(gridHtml);
  var gridSelector  = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID ));

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
    change : registerGridItemDblClickFunc,
    selectable: "multiple cell",
    sortable: true
  });

  // registerGridItemDblClickFunc();
  // console.log(gridSelector.html());
  $(gridSelector).outerWidth($('#FourSplitScreen' + gridViewPointer.gridID).position().left +  $('#FourSplitScreen' + gridViewPointer.gridID).outerWidth())
  $(gridSelector).height(window.innerHeight - $('#FourSplitScreen'+ gridViewPointer.gridID).offset().top - $('#FourSplitScreen'+ gridViewPointer.gridID).outerHeight() - 20)

  containerLeft = $(gridSelector).width() + 15;

  gridViewPointer.ChartItem = [];

}

function registerGridItemDblClickFunc() {
    // var gridItemSelector = $(gridViewPointer.gridData.find('.gridOne'))
    // console.log("gridViewPointer.pageID: " + gridViewPointer.pageID);
    // console.log("gridViewPointer.gridID: " + gridViewPointer.gridID);
   var selectedRows = this.select();
  //  var time = 0
    selectedRows.dblclick(function(e) {
      times ++
      if( times % 2 === 1) {
        console.log(times)
        var objectID = gridViewPointer.pageID;
        var HoldObjectID = selectedRows[0].textContent;
        // console.log ('ObjectID: ' + objectID);
        // console.log ('HoldObjectID: ' + HoldObjectID);
        if (gridViewPointer.ChartItem[HoldObjectID] !== true) {
          initializeChart(gridViewPointer, HoldObjectID);
          reqQrySubscriberFunc(objectID, HoldObjectID);
          gridViewPointer.ChartItem[HoldObjectID] = true;
        }
        nodeQueue.unshift($('#'+selectedRows[0].textContent + 'Model'))
        nodePosition(screenSelect)
        mouseEventProcess()
        // SortDivHandler.Initialize();
      }
    });
}

function initializeChart(gridViewPointer, chartID) {
  var gridHtml = "<div id=\"" + chartID + "Model\" class=\" UsageModel AttrItem\">\
                  <div id=\"" + chartID + "Toolbar\"  class=\" toolbar k-grid-toolbar\"></div>\
                  <div id=\"" + chartID + "\" class = 'highstockChart' ></div></div>"

  gridViewPointer.chartData.append(gridHtml);
  // console.log (gridViewPointer.chartData.html());

  var curChartSelector = $(gridViewPointer.chartData.find('#'+chartID));
  var curChartModelSelector = $(gridViewPointer.chartData.find('#'+chartID+'Model'));
  var curChartToolbarSelector = $(gridViewPointer.chartData.find('#'+chartID+'Toolbar'));
   // console.log ('containerLeft: ' + containerLeft);
  // console.log ('char process id : ' + process.pid);
  // curChartModelSelector.css({'left'   : containerLeft + 40, 'top' : 0,
  //                            'width'  : 300,
  //                            'height' : 300});

  var highchartsToolbar = {title : chartID}
  curChartToolbarSelector.html(templateModel(highchartsToolbar));

  curChartSelector.highcharts('StockChart', {
    chart: {
      animation: false,
      marginTop: 30,
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
        max: 10, // 控制Y轴最大值，设成101是为了能显示100的grid
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
  setChartData(gridViewPointer, curChartModelSelector, chart, chartID);
}

function setChartData(gridViewPointer, curChartModelSelector, chart, chartID) {
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
      // addDataToChart(chart , data);
      RealTimeChartData.push(data);
    } else {
      ++dataNumb;
      nonRealTimeChartData.push([tranTimeToUTC(data.MonDate, data.MonTime), parseFloat(data.AttrValue)]);
      curTime = (new Date()).toTimeString().substring(0,8);

      if ( MinusTime(curTime, lastTime) > realTimeLine ||
           MinusTime(curTime, firstTime) > timeLimit)  {
          console.log ('1: ' + lastTime);
          console.log ('2: ' + curTime);
          console.log ('dataNumb: ' + dataNumb);
          console.log ('data.MonTime: ' + data.MonTime);
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
          addDataToChart(chart, RealTimeChartData[i]);
        }
        RealTimeChartData = [];
      }
    }
  }, updateFrequency)
}

// function setChartData(gridViewPointer, curChartModelSelector, chart, chartID, updateTime) {
//   var rtnDataName = gridViewPointer.pageID+'.'+chartID;
//   var chartDataX = [];
//   var chartDataY = [];
//   var dataNumb = 0;
//   var isRealTime = false;
//   var realTimeLine =100;
//
//   var nonRealTimeChartData = [];
//
//   userApi.emitter.on (rtnDataName, function(data){
//     // console.log(data);
//     var curTime = (new Date()).toTimeString().substring(0,8);
//     // console.log('data.MonTime: ' + data.MonTime);
//     // console.log('curTime:      ' + curTime);
//     // console.log(MinusTime(curTime, data.MonTime));
//
//     if (true === isRealTime) {
//       // console.log('is realTime')
//       addDataToChart(chart , data);
//     } else {
//       ++dataNumb;
//       // nonRealTimeChartData.push([data.MonTime, data.AttrValue]);
//       nonRealTimeChartData.push([tranTimeToUTC(data.MonDate, data.MonTime), parseFloat(data.AttrValue)]);
//       // chartDataX.push(data.MonTime);
//       // chartDataY.push(parseFloat(data.AttrValue));
//
//       var curTime = (new Date()).toTimeString().substring(0,8);
//       if (MinusTime(curTime, data.MonTime) < realTimeLine ) {
//           isRealTime = true;
//           // console.log (chartDataX);
//           // console.log('data.MonDate' + data.MonDate);
//
//           // chart.xAxis[0].setCategories(chartDataX);
//           // chart.series[0].setData(chartDataY);
//
//           chart.series[0].setData(nonRealTimeChartData);
//           curChartModelSelector.show();
//           // console.log(dataNumb);
//       }
//     }
//   });
// }

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

  return utctime;
}

function addDataToChart(chart, data) {
  var series = chart.series[0];
  series.addPoint([data.MonTime, parseFloat(data.AttrValue)], true, true);
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

function getConfigData() {
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

function transformGridData(originalData) {
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

function gridChangeFunc(Pointer) {
  return (function(gridViewPointer){
    var selectedRows = this.select();
    var objectID = gridViewPointer.pageID;
    var HoldObjectID = $(selectedRows).text();

    console.log ('ObjectID: ' + objectID);
    console.log ('HoldObjectID: ' + HoldObjectID);

    reqQrySubscriberFunc(objectID, HoldObjectID);
  })(Pointer);
}

/*
注册实时回调监听函数，只注册一次。
回调数据中的ObjectID，AttrType标记不同的请求。
在接受到数据后，以ObjectID+AttrType为名将数据发送到对应请求注册的监听接口中。
*/
function registerRtnObjectAttrTopic() {
  if (window.registerRtnObjectAttrTopic === false) {
    userApi.emitter.on(EVENTS.RtnObjectAttrTopic, function(data){
      // console.log(data);
      var curRtnMessageName = data.ObjectID + '.' + data.AttrType;
      userApi.emitter.emit(curRtnMessageName, data);
    });
    window.registerRtnObjectAttrTopic = true;
  }
}

function reqQrySubscriberFunc(objectID, attrType){
  var reqQrySubscriberData = new userApiStruct.CShfeFtdcReqQrySubscriberField();
  reqQrySubscriberData.ObjectID  = objectID+'.'+attrType;
  reqQrySubscriberData.ObjectNum = -1;
  reqQrySubscriberData.KeepAlive = 1;
  // console.log (reqQrySubscriberData.ObjectID);
  var reqQrySubscriberField = {}
  reqQrySubscriberField.reqObject  = reqQrySubscriberData;
  reqQrySubscriberField.RequestId  = ++window.ReqQrySubscriberTopicRequestID;
  reqQrySubscriberField.rtnMessage = reqQrySubscriberData.ObjectID;

  // registerRtnObjectAttrObjectID(reqQrySubscriberField.rtnMessage);

  userApi.emitter.emit(EVENTS.ReqQrySubscriberTopic, reqQrySubscriberField);
}

function nodePosition(num) {
  // var Spacing =
  if(num <= 0 || num > 4) return
  if(num < 4 && num > 0) {
    for(var th = 0; th < num; th ++) {
      var node = nodeQueue[th]
      if(true === $(node).hasClass('UsageModel')) {
        $(node).show().css({'top' : containerHeight* th / num + 5, 'left' : containerLeft, 'width' : screenWidth + borderWidth, 'height' : containerHeight/ num + borderWidth - 15})
        var chart = $(node).find('.highstockChart').highcharts()
        chart.setSize($(node).width() , $(node).height() - toolbarHeight, false );
      } else {
        $(node).show().css({'top' : containerHeight* th / num + 5, 'left' : containerLeft, 'width' : screenWidth, 'height' : containerHeight/ num - 15})
      }
    }
  } else if (num === 4) {
   var node = nodeQueue[0]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).show().css({'top' : 0 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 + borderWidth - 15, 'height' : containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
   } else {
     $(node).show().css({'top' : 0 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 - 15 , 'height' : containerHeight / 2 - 15})
   }
   var node = nodeQueue[1]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).show().css({'top' : 0 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 + borderWidth - 15, 'height' : containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
   } else {
     $(node).show().css({'top' : 0 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 - 15, 'height' : containerHeight / 2 - 15})
   }
   var node = nodeQueue[2]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 + borderWidth - 15, 'height' : containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
   } else {
     $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 - 15, 'height' : containerHeight / 2 - 15})
   }
   var node = nodeQueue[3]
   if(true === $(node).hasClass('UsageModel')) {
     $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 + borderWidth - 15, 'height' : containerHeight / 2 + borderWidth - 15})
     var chart = $(node).find('.highstockChart').highcharts()
     chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
   } else {
     $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 - 15, 'height' : containerHeight / 2 - 15})
   }
 }
 // 将不展示的属性隐藏
 // 方法为： 将数组中 num之后的 属性全部隐藏。再将前 num 个数据展示出来 这样可以避免前后相同的数据被隐藏 , 如 [A,B,C,D,A] num为 4
 for(var i = num; i < nodeQueue.length; i ++) {
   $(nodeQueue[i]).hide()
 }
 for(var j = 0; j < num; j++) {
   $(nodeQueue[j]).show()
 }
//  for(var i = num; i < nodeQueue.length; i ++) {
//    var flag = 0
//    for(var j = 0; j <num; j++) {
//      if(nodeQueue[i] === nodeQueue[j]) {
//        flag = 1
//        break
//      }
//    }
//    if(flag !== 1) {
//      console.log(nodeQueue[i])
//      $(nodeQueue[i]).hide()
//    }
//  }
}
function SplitScreen() {
  $('.SplitScreenBtn').click(function(e) {
    console.log(this.id)
    console.log('BinaryScreen' + gridViewPointer.gridID)
    console.log(this.id === 'BinaryScreen' + gridViewPointer.gridID)
    if(this.id === 'BinaryScreen' + gridViewPointer.gridID) {
      screenSelect = 2
      nodePosition(screenSelect)
    } else if(this.id === 'ThreeSplitScreen' + gridViewPointer.gridID) {
      screenSelect = 3
      nodePosition(screenSelect)
    } else if(this.id === 'FourSplitScreen' + gridViewPointer.gridID) {
      screenSelect = 4
      nodePosition(screenSelect)
    } else {
      screenSelect = 1
      nodePosition(screenSelect)
    }
  })
}
var SortDivHandler = {
  CurrentLocationX: 0,
  CurrentLocationY: 0,
  CurrentSortFlag: 0,
  CurrentSortDiv: null,
  CurrentZindex: 0,
  CurrentSortMove: 0,
  Initialize: function() {
    console.log('Initialize')
    // var gridSelector  = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID ));

    var isStart = false;
    var isDrag = true;
    $('.k-grid-toolbar').mousedown(function(e) {
      // mouseEventProcess()
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
        SortDivHandler.CurrentSortDiv.parent().css("z-index", 0).css("opacity", 0.6);
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
    $(".k-grid-toolbar").mousemove(function() {
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

    $(".k-grid-toolbar").mouseup(function() {
      if (isDrag == false) return;
      SortDivHandler.CurrentSortMove = 1;
    });
  }
}
function mouseEventProcess() {
   //// 鼠标拖拽操作
  var dragging = false
  var node = null
  var nodeCurPosition = []
  $(".k-grid-toolbar").mousedown(function(e) {
    dragging = true
    node = $(this).parent()
    // var nodeLeft = window.innerWidth - $('.baobiaoContainer').width() -$('.tree-view-resize-handle').width()/2
    $(node).css('z-index', ++ zIndex)
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
  document.onclick = function(e) { //将鼠标点击的属性对象放置最上层
    $(e.target).parents('.AttrItem').css('z-index',  ++ zIndex)
  }
  $('.gridClose').click(function(e) { //关闭
    var node = $(this).parent().parent()
    $(node).hide()
  })
  $('.k-grid-toolbar').dblclick(function(nodeCurPosition) { //toolbar 双击操作
    MaxMinClickedTimes ++
    var node = $(this).parent()
    resizeNode(node)
  })
  $('.gridMax').click(function(nodeCurPosition) { //放大缩小
    MaxMinClickedTimes ++
    var node = $(this).parent().parent()
    resizeNode(node)
  })
}

function windowResizeEvent() {
  $(window).resize(function(){
    console.log('window resize!')
    var gridSelector  = '#gridOne' + gridViewPointer.gridID
    $(gridSelector).outerWidth($('#FourSplitScreen' + gridViewPointer.gridID).position().left +  $('#FourSplitScreen' + gridViewPointer.gridID).outerWidth())
    $(gridSelector).height(window.innerHeight - $('#FourSplitScreen'+ gridViewPointer.gridID).offset().top - $('#FourSplitScreen'+ gridViewPointer.gridID).outerHeight() - 20)

    containerHeight = window.innerHeight - 50
    containerLeft = $('#FourSplitScreen' + gridViewPointer.gridID).position().left + $('#FourSplitScreen'+ gridViewPointer.gridID).outerWidth() + 5;
    screenWidth = $('.baobiaoContainer').width() - containerLeft - 20
    nodePosition(screenSelect)
  })
}

function resizeNode(node) {
  // var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
  var nodeMaxWidth = $('.baobiaoContainer').width() - 10
  var nodeMaxHeight = window.innerHeight - 50
  var nodeRight = window.pageYOffset + $('.tab-bar').height()
  $(node).css('z-index', ++ zIndex)
  if (MaxMinClickedTimes % 2 === 1) { // 保存当前的位置和长宽
    nodeCurPosition =  $(node).position()
    nodeWidth = $(node).width()
    nodeHeight = $(node).height()
  }
  if (nodeMaxWidth !==  $(node).width()) { //最大化
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
      //  console.log(toolbarHeight)
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
// function SyslogEvent(index) {
//   var gridrizhidata = {title : '日志事件' }
//   var rizhiNode = $('#rizhi' +index)
//   $(rizhiNode).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth,'height' : containerHeight})
//   $(rizhiNode).kendoGrid({
//     scrollable: false,
//     toolbar:  templateModel(gridrizhidata),
//     columns: [{
//       field: '日期',
//       title: '日期'
//     }, {
//       field: '时间',
//       title: '时间'
//     }, {
//       field: '告警级别',
//       title: '告警级别'
//     }, {
//       field: '事件名',
//       title: '事件名'
//     }
//     ],
//     selectable: "multiple cell",
//     sortable: true,
//     dataSource:  [{'日期':'2016.3.8','时间':'15:21:22','告警级别':' 1级','事件名':'着火啦'},
//              {'日期':'2016.3.8','时间':'15:43:09','告警级别':' 3级','事件名':'失水了'},
//              {'日期':'2016.3.8','时间':'16:54:11','告警级别':' 1级','事件名':'贼来了'},
//              {'日期':'2016.3.8','时间':'17:14:22','告警级别':' 4级','事件名':'抢劫了'}
//             ]
//   })
//   $(rizhiNode).hide()
// }
// function DisUsage(index) {
//   var initialData = initialDataGenerator()
//   var seriesData = []
//   for (var k = 0; k < 1; k++) {
//     seriesData.push({
//       name: 'Random data' + k,
//       data: initialData,
//       animation: false
//     })
//   }
//   $('#DisUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
//   console.log($('#DisUsageModel' +  index).width())
//   var highchartsToolbar = {title : '业务进程所在文件系统使用率'}
//   $("#DisUsageToolbar" + index).html(templateModel(highchartsToolbar));
//   $('#DisUsage' + index).highcharts('StockChart', {
//     chart: {
//       animation: false,
//       marginTop: 30
//       },
//       height : containerHeight,
//       reflow: true,
//       xAxis: {
//         enabled: true
//       },
//       rangeSelector: {
//           enabled: false
//       },
//       yAxis: {
//         max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
//         min: 0, // 设定y轴最小值
//         minTickInterval: 0,
//         tickAmount: 6, // 控制y轴标线的个数
//         tickPixelInterval: 10, // 控制标线之间的中间间隔。
//         title: {
//           text: 'CPU 消耗（%）'
//         },
//         allowDecimals: false, // 是否显示小数。
//         opposite: false
//       },
//       scrollbar: {
//         enabled: false
//       },
//       exporting: {
//         enabled :false
//       },
//       credits: {
//         enabled: false // 禁用版权信息
//       },
//       series: seriesData
//       })
//      var chart = $('#DisUsage' + index).highcharts()
//      chart.setSize($('#DisUsageModel' +  index).width(), $('#DisUsageModel' +  index).height() - toolbarHeight, false );
//     //  console.log(screenWidth)
//      $('#DisUsageModel' + index).hide()
//        //  $("#toobar").hide()
// }
// function CPUUsage(index) {
//   var initialData = initialDataGenerator()
//   var seriesData = []
//   for (var k = 0; k < 1; k++) {
//     seriesData.push({
//       name: 'Random data' + k,
//       data: initialData,
//       animation: false
//     })
//   }
//   $('#CPUUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
//   // console.log(containerLeft)
//   var highchartsToolbar = {title : '业务进程CPU使用率'}
//   $("#CPUUsageToolbar" + index).html(templateModel(highchartsToolbar));
//   $('#CPUUsage' + index).highcharts('StockChart', {
//     chart: {
//       animation: false,
//       marginTop: 30
//       },
//       height : containerHeight,
//       reflow: true,
//       xAxis: {
//         enabled: true
//       },
//       rangeSelector: {
//           enabled: false
//       },
//       yAxis: {
//         max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
//         min: 0, // 设定y轴最小值
//         minTickInterval: 0,
//         tickAmount: 6, // 控制y轴标线的个数
//         tickPixelInterval: 10, // 控制标线之间的中间间隔。
//         title: {
//           text: 'CPU 消耗（%）'
//         },
//         allowDecimals: false, // 是否显示小数。
//         opposite: false
//       },
//       scrollbar: {
//         enabled: false
//       },
//       exporting: {
//         enabled :false
//       },
//       credits: {
//         enabled: false // 禁用版权信息
//       },
//       series: seriesData
//       })
//      var chart = $('#CPUUsage' + index).highcharts()
//      chart.setSize($('#CPUUsageModel' +  index).width(), $('#CPUUsageModel' +  index).height() - toolbarHeight, false );
//     //  console.log(screenWidth)
//      $('#CPUUsageModel' + index).hide()
//        //  $("#toobar").hide()
// }
// function TestUsageModel(index) {
//   var initialData = initialDataGenerator()
//   var seriesData = []
//   for (var k = 0; k < 1; k++) {
//     seriesData.push({
//       name: 'Random data' + k,
//       data: initialData,
//       animation: false
//     })
//   }
//   $('#TestUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
//   // console.log($('#TestUsageModel' +  index).width())
//   var highchartsToolbar = {title : '未处理告警事件'}
//   $("#TestUsageToolbar" + index).html(templateModel(highchartsToolbar));
//   $('#TestUsage' + index).highcharts('StockChart', {
//     chart: {
//       animation: false,
//       marginTop: 30
//       },
//       height : containerHeight,
//       reflow: true,
//       xAxis: {
//         enabled: true
//       },
//       rangeSelector: {
//           enabled: false
//       },
//       yAxis: {
//         max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
//         min: 0, // 设定y轴最小值
//         minTickInterval: 0,
//         tickAmount: 6, // 控制y轴标线的个数
//         tickPixelInterval: 10, // 控制标线之间的中间间隔。
//         title: {
//           text: 'CPU 消耗（%）'
//         },
//         allowDecimals: false, // 是否显示小数。
//         opposite: false
//       },
//       scrollbar: {
//         enabled: false
//       },
//       exporting: {
//         enabled :false
//       },
//       credits: {
//         enabled: false // 禁用版权信息
//       },
//       series: seriesData
//       })
//      var chart = $('#TestUsage' + index).highcharts()
//      chart.setSize($('#TestUsageModel' +  index).width(), $('#TestUsageModel' +  index).height() - toolbarHeight, false );
//     //  console.log(screenWidth)
//      $('#TestUsageModel' + index).hide()
//        //  $("#toobar").hide()
// }
// function CreateAttrObjects(index) {
//   SyslogEvent(index)
//   CPUUsage(index)
//   DisUsage(index)
//   TestUsageModel(index)
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
function beginReceiveData() {

}

function stopReceiveData() {

}
module.exports.setup = setup
module.exports.beginReceiveData = beginReceiveData
module.exports.stopReceiveData = stopReceiveData
