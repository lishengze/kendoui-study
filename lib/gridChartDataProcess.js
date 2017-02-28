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
                  <i  class = 'gridClose fa fa-times'></i>")

function setup(gridViewPointer) {
  console.log ('gridChartDataProcess setup!')
  gridViewPointer.zIndex = 1;
  gridViewPointer.MaxMinClickedTimes = 0;
  gridViewPointer.times = 0
  gridViewPointer.nodeQueue = [] // 存储选中的属性节点信息
  gridViewPointer.itemsArray = []
  gridViewPointer.screenSelect = 1; // 当前页面全局参数，表示选择的分屏个数
  var FourSplitScreenSelector = gridViewPointer.FourSplitScreen
  gridViewPointer.containerHeight = window.innerHeight - 45
  gridViewPointer.containerLeft = $(FourSplitScreenSelector).position().left + $(FourSplitScreenSelector).outerWidth() + 5;
  gridViewPointer.screenWidth = $('.baobiaoContainer').width() - gridViewPointer.containerLeft - 20

  g_GlobalChart[gridViewPointer.pageID] = [];

  window.configData = getConfigData();
  registerRtnObjectAttrTopic(gridViewPointer);
  initializeGrid(gridViewPointer);
  registerGridDataReceiveFunc(gridViewPointer);
  SortDivHandler.Initialize(gridViewPointer);

}

function registerGridDataReceiveFunc(gridViewPointer) {
      var gridDataEventName = gridViewPointer.gridID;
      console.log(gridDataEventName)
      // var transGridData = []
      userApi.emitter.on(gridDataEventName, function(gridRspData){
          // console.log("gridDataEventName: " + gridDataEventName);
          var transGridData = transformGridData(gridRspData.rspData);
          console.log(transGridData)
          // console.log(transGridData[1].itemValue)
          var dataSource = new kendo.data.DataSource({data:transGridData});
          // console.log(gridNodeId)
          var gridSelector = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID));
          var grid = gridSelector.data("kendoGrid");
          grid.setDataSource(dataSource);
          // for(var i = 0;i<transGridData.length;i++) {
          //   var rtnName = gridViewPointer.pageID + '.' + transGridData[i].itemId;
          //   console.log(rtnName)
          //   userApi.emitter.on (rtnName , function(data){
          //     if (true === gridViewPointer.isClosed) {
          //         return;
          //     }
          //     console.log(rtnName)
          //     var itemName = rtnName.substring(gridViewPointer.pageID.length + 1)
          //     // console.log(itemName)
          //     for(var i = 0;i<transGridData.length;i++) {
          //       if(itemName === transGridData[i].itemId){
          //         // console.log(itemName)
          //         transGridData[i].itemValue = 5;
          //         transGridData[i].time = tranTimeToUTC(data.MonDate, data.MonTime)
          //         // console.log(transGridData)
          //         grid.setDataSource(new kendo.data.DataSource({data:transGridData}));
          //         break;
          //       }
          //     }
              // curChart.isNewDataCome = true;
              // console.log(transGridData)
              // transGridData[i].itemValue = Math.round(parseFloat(data.AttrValue)*100/100);
              // transGridData[i].time = tranTimeToUTC(data.MonDate, data.MonTime)
              // // console.log(transGridData)
              // grid.setDataSource(new kendo.data.DataSource({data:transGridData}));
            // });
          // }

      })
      // console.log(transGridData)
      // var rtnDataName = gridViewPointer.pageID;

      // userApi.emitter.on (rtnDataName, function(data){
      //   if (true === gridViewPointer.isClosed) {
      //       return;
      //   }
      //   curChart.isNewDataCome = true;
      //   var val = Math.round(parseFloat(data.AttrValue)*100/100)
      //   var curRtnData = [tranTimeToUTC(data.MonDate, data.MonTime), val];
      //   curChart.callbackDataForSet.push(curRtnData);
      //   curChart.callbakcDataForAdd.push(curRtnData);
      // });
}

function initializeGrid(gridViewPointer) { // 初始化 grid 属性列表 表格
  var gridID =  'gridOne' + gridViewPointer.gridID
  var gridHtml = "<div id= " + gridID + " class=\"gridOne AttrItem\"></div>"
  gridViewPointer.gridData.append(gridHtml);
  var gridSelector  = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID ));
  gridViewPointer.ChartItem = []; // grid表创建之后，建立一个 chart Item，存储属性值

  gridSelector.kendoGrid({
    scrollable: true,
    resizable: true,
    toolbar:  templateModel(gridOnedata),
    columns: [
       { title: " <input  type='checkbox' class ='checkAll'/> ",
         template: "<input type='checkbox' class='grid_checkbox' />", width: 30, filterable: false, sortable: false },
      {
     field: 'itemName', title:'指标名称'
    }, {
     field: 'itemId', title:'指标ID'
   },
    {field: 'itemValue', title:'指标值'
  },{field: 'time', title:'时间'
   }
    ],
    selectable: "multiple",
    change : function(e) {
      // console.log(gridViewPointer.gridID)
      gridViewPointer.times ++
      var selectedRows = this.select();
      console.log(selectedRows[0].childNodes[2].textContent)
      if( gridViewPointer.times % 2 === 1) {
        var selectedNode = null;
        var selectedText = selectedRows[0].childNodes[2].textContent; // 如果选中的为指标名称，自动转为指标ID
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
    sortable: true
  });
  // gridSelector.bind('change',  registerGridItemDblClickFunc(gridViewPointer))
  $(gridSelector).outerWidth($(gridViewPointer.FourSplitScreen).position().left +  $(gridViewPointer.FourSplitScreen).outerWidth())
  $(gridSelector).height(window.innerHeight - $(gridViewPointer.FourSplitScreen).offset().top - $(gridViewPointer.FourSplitScreen).outerHeight() - 20)
  // console.log($(gridSelector).css('z-index'))
  $(gridSelector).css('z-index', 0) // 左侧属性列表初始z-index 值设为 0
  containerLeft = $(gridSelector).width() + 15;
  $(gridViewPointer).delegate('input:checkbox', 'click', function () {//checkbox选中事件操作。
    // console.log($(this))
    var state = $(this).is(':checked');
    // console.log(state)
    if(state) {
      // $($(this)[0].parentNode).addClass("k-state-selected");
    } else {
      // $($(this)[0].parentNode).removeClass("k-state-selected");
    }
  })
  $(gridViewPointer).find('.checkAll').on('click',function(){ //全部选中事件操作。
    console.log('selectAllRow')
    var state = $(this).is(':checked');
    if(state){
    //selectRow();
      $('tr').find('[type=checkbox]').prop('checked', true);
      $('tr').removeClass("k-state-selected");
      $('tr').addClass("k-state-selected");
    } else {
      $('tr').find('[type=checkbox]').prop('checked', false);
      $('tr').removeClass("k-state-selected");
    }
  })

}

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
  curChartModelSelector.css('z-index', 1)
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
      credits: {
        enabled: false // 禁用版权信息
      },
      tooltip: {
        // valueDecimals: 1,
      },
      rangeSelector: {
        buttons: [],
        // selected: 1,
        inputDateFormat: '%Y-%m-%d',
        enabled: true,
        inputDateParser:function () {
           // 向后台发送请求历史数据
           console.log("send req")

        }

     },
      exporting: {
          buttons: {
              contextButton: { enabled: false },
              customButton: {
                  text: '散点图',
                  onclick: function (e) {
                    // console.log($(e.target))
                    if($(e.target)[0].textContent === '散点图') {
                      $(e.target)[0].textContent = '趋势图'
                      var chart = $(this.renderTo).highcharts()
                      // console.log(chart.series[0])
                      chart.series[0].update({
                        type:'scatter'
                      })
                    } else {
                      $(e.target)[0].textContent = '散点图'
                      var chart = $(this.renderTo).highcharts()
                      // console.log(chart.series[0])
                      chart.series[0].update({
                        type:'line'
                      })

                    }
                  }
              },
              customButton2: {
                   text: '历史数据查询',
                   onclick: function (e) {
                     var chart = $(this.renderTo).highcharts();
                       chart.update({
                            // series:[{
                            //    data: []
                            //  }],
                             rangeSelector : {
                                   enabled: true,
                                   inputEnabled: true
                                 },
                              exporting :{
                                buttons: {
                                  customButton1: {// 发送请求按钮
                                    enabled: true
                                  },
                                  customButton2: {//历史数据查询
                                    enabled: false
                                  },
                                  customButton3: {//当前数据
                                    enabled: true
                                  }
                                }
                              }
                       })
                 }
               },
               customButton1: {
                 enabled: false,
                 text: '发送请求',
                 onclick: function () {
                   var chart = $(this.renderTo).highcharts();
                   var inputRange = $(this.renderTo).find('.highcharts-range-input')
                   console.log($(inputRange))
                   if($(inputRange)[0] !== undefined) {
                     console.log($(inputRange)[0].textContent)
                     // var text2 = $(this.renderTo).find('text')[7].textContent
                     console.log($(inputRange)[1].textContent)
                     reqDate(chart)
                    }
                 }
               },

              customButton3: {
                   enabled: false,
                   text: '当前数据',
                   onclick: function () {
                       var chart = $(this.renderTo).highcharts();
                       chart.update({
                         rangeSelector : {
                           enabled: false
                         },
                         series:[{
                           data: latestData
                         }
                         ]
                       })
                       chart.update({
                          exporting :{
                            buttons: {
                              customButton1: {// 发送请求按钮
                                enabled: false
                              },
                              customButton2: {//历史数据查询
                                enabled: true
                              },
                              customButton3: {//当前数据
                                enabled: false
                              }
                            }
                          }
                       })
                   }
               },
          }
      },
      series: [{
            name: 'AttrValue',
            data: []
             }]
      })

  var chart = curChartSelector.highcharts();

  g_GlobalChart[gridViewPointer.pageID][chartID] = new g_chartDataStruct();
  g_GlobalChart[gridViewPointer.pageID][chartID].chart = chart;
  setChartDataGlobal(gridViewPointer, chartID, g_GlobalChart[gridViewPointer.pageID][chartID] )
}

function setChartDataGlobal(gridViewPointer, chartID, curChart){
  var gridSelector = $(gridViewPointer.gridData.find('#gridOne' + gridViewPointer.gridID));
  var grid = gridSelector.data("kendoGrid");
  // console.log(grid)
  // console.log(gridViewPointer.pageID+'.'+chartID)
  // console.log(gridSelector)
  var select= ":contains('" + chartID + "') "
  console.log($(gridSelector).find(select)[3].textContent) //获取选中的item 列表
  var rtnDataName = gridViewPointer.pageID+'.'+chartID;
  // console.log grid.find('rtnDataName')
  console.log(rtnDataName)
  var gridLength = grid.dataSource.total();
  console.log(grid.dataSource.data()[0].itemId)
  console.log(gridLength)
  var gridName = []
  for(var i = 0; i <gridLength; i++){
    // console.log(grid.dataSource.data[i])
    gridName.push(grid.dataSource.data()[i].itemId)
  }
  userApi.emitter.on (rtnDataName, function(data){
    if (true === gridViewPointer.isClosed) {
        return;
    }
    curChart.isNewDataCome = true;
    var val = Math.round(parseFloat(data.AttrValue)*100/100)
    var curRtnData = [tranTimeToUTC(data.MonDate, data.MonTime), val];
    curChart.callbackDataForSet.push(curRtnData);
    curChart.callbakcDataForAdd.push(curRtnData);
  });
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
          'itemName': configData[originalData[tmpindex].HoldObjectID].comment,
          'itemId' : originalData[tmpindex].HoldObjectID,
          'itemValue': 0,
          'time': 0,
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
      // console.log($(this))
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
  var nodeMaxHeight = window.innerHeight - 45
  var nodeRight = window.pageYOffset + $('.tab-bar').height()
  $(node).css('z-index', ++ gridViewPointer.zIndex)
  if (gridViewPointer.MaxMinClickedTimes % 2 === 1 ) { // 保存当前的位置和长宽
    nodeCurPosition =  $(node).position()
    nodeWidth = $(node).width()
    nodeHeight = $(node).height()
    gridViewPointer.isResize = false
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
     }
  }
}
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
