_ = require('underscore-plus')
function setup(index) {
  // var html = '<div class = "leftContainer"><div class = "gridOne"> </div></div>\
  //             <div class = "rizhi"></div>\
  //             <div class = "CPUUsageModel">\
  //              <div class = "toolbar k-grid-toolbar"></div>\
  //              <div class = "CPUUsage highstockChart"></div></div>'
  // $('.baobiaoContainer').append(html)
  var containerLeft = $('.gridOne').width() + 15
  var screenWidth = $('.baobiaoContainer').width() - containerLeft - 20
  var borderWidth = 6
  var containerHeight = window.innerHeight - 50
  var toolbarHeight = 20.5
  //var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
  var highchartsHeight =containerHeight - toolbarHeight//
  var zIndex = 0
  var screenSelect = 1 // 全局参数，表示选择的分屏个数
  $('#gridOne' + index).height(window.innerHeight - 100)
  $(window).resize(function() {// 根据窗口大小自动调整treeview窗口高度
   //process here
    windowHeight = window.innerHeight
    var resizeHeight = windowHeight -100
    $( '#gridOne' + index).height(resizeHeight)// 设置treeview窗口的高度
  });
  var gridOnedata = {title : '属性列表' }
  var templateModel = kendo.template("<strong style = 'color:indianred'>#: title #  </strong>\
                    <i  class = 'gridMax fa fa-clone'></i>\
                    <i  class = ' gridClose fa fa-times'></i>")
  var indexData =  [{'指标名称':'对象是否活跃标示','指标ID':'Active'},
          {'指标名称':'日志事件','指标ID':'SyslogEvent'},
          {'指标名称':'已处理告警事件','指标ID':'ProcessedEvent'},
          {'指标名称':'业务进程所在文件系统使用率','指标ID':'DisUsage'},
          {'指标名称':'业务进程CPU使用率','指标ID':'CPUUsage'},
          {'指标名称':'未处理告警事件','指标ID':'UnprocessdEvent'}]

  $('#gridOne' + index).kendoGrid({
    scrollable: false,
    resizable: true,
    toolbar:  templateModel(gridOnedata),
    columns: [{
     field: '指标名称',
    }, {
     field: '指标ID',
    }
    ],
    change: onChange,
    selectable: "multiple cell",
    sortable: true,
    dataSource: indexData
  })
  var nodeQueue = []
  function onChange() {
    var selectedRows = this.select();
    var dataItem = this.dataItem(selectedRows)
    switch (selectedRows[0].textContent) {
      case '日志事件':
      case 'SyslogEvent':
        $('#rizhi' + index).show().css('z-index', ++ zIndex)// zIndex解决 切换属性时的覆盖问题
        nodeQueue.unshift($('#rizhi' +index))
        nodePostion(screenSelect)
        // console.log(nodeQueue)
        break
      case '业务进程所在文件系统使用率':
      case 'DisUsage':
        $('#DisUsageModel' + index).show().css('z-index', ++ zIndex)
        nodeQueue.unshift($('#DisUsageModel' + index))
        nodePostion(screenSelect)
        break
      case '业务进程CPU使用率':
      case 'CPUUsage':
        $('#CPUUsageModel' + index).show().css('z-index', ++ zIndex)
        nodeQueue.unshift($('#CPUUsageModel' + index))
        nodePostion(screenSelect)
        break
      case '未处理告警事件':
      case 'UnprocessdEvent':
        $('#TestUsageModel' + index).show().css('z-index', ++ zIndex)
        nodeQueue.unshift($('#TestUsageModel' + index))
        nodePostion(screenSelect)
        break
      default:
   }
  };
  SyslogEvent()
  CPUUsage()
  DisUsage()
  TestUsageModel()
  // 鼠标响应事件
  // 记录节点的大小和位置信息
  var nodeWidth  = 0
  var nodeHeight = 0
  var nodePosition = {}
  var i = 0
  // var chartNode =  $('#CPUUsage').parents('baobiaoContainer').find('#CPUUsage')
  // var chart = $('#CPUUsage').highcharts()
  // console.log(chart)
  function resizeWindow(node) {
    // var toolbarHeight = 2 * parseInt($('#CPUUsageModel' + index ).css('border-width')) + $('.k-grid-toolbar').height() //计算出边框和toolbar的高度。便于设定 Highcharts高度
    console.log(toolbarHeight);
    var nodeMaxWidth = $('.baobiaoContainer').width() - 10
    var nodeMaxHeight = window.innerHeight - 50
    var nodeRight = window.pageYOffset + $('.tab-bar').height()
    $(node).css('z-index', ++ zIndex)
    if (i % 2 === 1) { // 保存当前的位置和长宽
      nodePosition =  $(node).position()
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
       $(node).css({ "left": nodePosition.left, "top": nodePosition.top })
       $(node).width(nodeWidth)
       $(node).height(nodeHeight)
       if (true === $(node[0]).hasClass('UsageModel')) {
         var chart = $(node[0]).find('.highstockChart').highcharts()
         chart.setSize(nodeWidth, nodeHeight - toolbarHeight , false );
         console.log(toolbarHeight)
       }
    }
  }
  $('.SplitScreenBtn').click(function(e) {
    if(this.id === 'BinaryScreen') {
      screenSelect = 2
      nodePostion(screenSelect)
    } else if(this.id === 'ThreeSplitScreen') {
      screenSelect = 3
      nodePostion(screenSelect)
    } else if(this.id === 'FourSplitScreen') {
      screenSelect = 4
      nodePostion(screenSelect)
    } else {
      screenSelect = 1
      nodePostion(screenSelect)
    }
  })
  function nodePostion(num) {
    if(num <= 0 || num > 4) return
    if(num < 4 && num > 0) {
      for(var th = 0; th < num; th ++) {
        var node = nodeQueue[th]
        if(true === $(node).hasClass('UsageModel')) {
          $(node).show().css({'top' : containerHeight* th / num + 5, 'left' : containerLeft, 'width' : screenWidth + borderWidth, 'height' : containerHeight/ num + borderWidth - 5})
          var chart = $(node).find('.highstockChart').highcharts()
          chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
        } else {
          $(node).show().css({'top' : containerHeight* th / num + 5, 'left' : containerLeft, 'width' : screenWidth, 'height' : containerHeight/ num - 5})
        }
      }
    } else if (num === 4) {
     var node = nodeQueue[0]
     if(true === $(node).hasClass('UsageModel')) {
       $(node).show().css({'top' : 0 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 + borderWidth - 5, 'height' : containerHeight / 2 + borderWidth - 5})
       var chart = $(node).find('.highstockChart').highcharts()
       chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
     } else {
       $(node).show().css({'top' : 0 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 - 5 , 'height' : containerHeight / 2 - 5})
     }
     var node = nodeQueue[1]
     if(true === $(node).hasClass('UsageModel')) {
       $(node).show().css({'top' : 0 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 + borderWidth - 5, 'height' : containerHeight / 2 + borderWidth - 5})
       var chart = $(node).find('.highstockChart').highcharts()
       chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false);
     } else {
       $(node).show().css({'top' : 0 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 - 5, 'height' : containerHeight / 2 - 5})
     }
     var node = nodeQueue[2]
     if(true === $(node).hasClass('UsageModel')) {
       $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 + borderWidth - 5, 'height' : containerHeight / 2 + borderWidth - 5})
       var chart = $(node).find('.highstockChart').highcharts()
       chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
     } else {
       $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft, 'width' : screenWidth / 2 - 5, 'height' : containerHeight / 2 - 5})
     }
     var node = nodeQueue[3]
     if(true === $(node).hasClass('UsageModel')) {
       $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 + borderWidth - 5, 'height' : containerHeight / 2 + borderWidth - 5})
       var chart = $(node).find('.highstockChart').highcharts()
       chart.setSize($(node).width(), $(node).height() - toolbarHeight  , false );
     } else {
       $(node).show().css({'top' : containerHeight / 2 + 5, 'left' : containerLeft + screenWidth / 2 - 5, 'width' : screenWidth / 2 - 5, 'height' : containerHeight / 2 - 5})
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
  $('.k-grid-toolbar').dblclick(function(e) { //toolbar 双击操作
    i ++
    var node = $(this).parent()
    resizeWindow(node)
  })
  $('.gridClose').click(function(e) { //关闭
    var node = $(this).parent().parent()
    $(node).hide()
  })
  $('.gridMax').click(function(e) { //放大缩小
    i ++
    var node = $(this).parent().parent()
    console.log(node)
    resizeWindow(node)
  })
  document.onclick = function(e) { //将鼠标点击的属性对象放置最上层
    $(e.target).parents('.AttrItem').css('z-index',  ++ zIndex)
  }
   // 鼠标拖拽操作
  var dragging = false
  var node
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
  // highcharts图表 resize操作
  // $('#CPUUsageModel' + index).resizable({
  //    // On resize, set the chart size to that of the
  //    // resizer minus padding. If your chart has a lot of data or other
  //    // content, the redrawing might be slow. In that case, we recommend
  //    // that you use the 'stop' event instead of 'resize'.
  //    resize: function() {
  //        console.log($(this))
  //        var chartNode = $(this).find('#CPUUsage' + index)
  //        var chart = $(chartNode).highcharts()
  //        console.log(chart)
  //        chart.setSize(
  //            $(this).width() - 20,
  //            $(this).height() - 20,
  //            false
  //        );
  //    }
  // });
  function SyslogEvent() {
    var gridrizhidata = {title : '日志事件' }
    var rizhiNode = $('#rizhi' +index)
    $(rizhiNode).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth,'height' : containerHeight})
    $(rizhiNode).kendoGrid({
      scrollable: false,
      toolbar:  templateModel(gridrizhidata),
      columns: [{
        field: '日期',
        title: '日期'
      }, {
        field: '时间',
        title: '时间'
      }, {
        field: '告警级别',
        title: '告警级别'
      }, {
        field: '事件名',
        title: '事件名'
      }
      ],
      selectable: "multiple cell",
      sortable: true,
      dataSource:  [{'日期':'2016.3.8','时间':'15:21:22','告警级别':' 1级','事件名':'着火啦'},
               {'日期':'2016.3.8','时间':'15:43:09','告警级别':' 3级','事件名':'失水了'},
               {'日期':'2016.3.8','时间':'16:54:11','告警级别':' 1级','事件名':'贼来了'},
               {'日期':'2016.3.8','时间':'17:14:22','告警级别':' 4级','事件名':'抢劫了'}
              ]
    })
    $(rizhiNode).hide()
  }
  function DisUsage() {
    var initialData = initialDataGenerator()
    var seriesData = []
    for (var k = 0; k < 1; k++) {
      seriesData.push({
        name: 'Random data' + k,
        data: initialData,
        animation: false
      })
    }
    $('#DisUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
    console.log($('#DisUsageModel' +  index).width())
    var highchartsToolbar = {title : '业务进程所在文件系统使用率'}
    $("#DisUsageToolbar" + index).html(templateModel(highchartsToolbar));
    $('#DisUsage' + index).highcharts('StockChart', {
      chart: {
        animation: false,
        marginTop: 30
        },
        height : containerHeight,
        reflow: true,
        xAxis: {
          enabled: true
        },
        rangeSelector: {
            enabled: false
        },
        yAxis: {
          max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
          min: 0, // 设定y轴最小值
          minTickInterval: 0,
          tickAmount: 6, // 控制y轴标线的个数
          tickPixelInterval: 10, // 控制标线之间的中间间隔。
          title: {
            text: 'CPU 消耗（%）'
          },
          allowDecimals: false, // 是否显示小数。
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
        series: seriesData
        })
       var chart = $('#DisUsage' + index).highcharts()
       chart.setSize($('#DisUsageModel' +  index).width(), $('#DisUsageModel' +  index).height() - toolbarHeight, false );
      //  console.log(screenWidth)
       $('#DisUsageModel' + index).hide()
         //  $("#toobar").hide()
  }
  function CPUUsage() {
    var initialData = initialDataGenerator()
    var seriesData = []
    for (var k = 0; k < 1; k++) {
      seriesData.push({
        name: 'Random data' + k,
        data: initialData,
        animation: false
      })
    }
    $('#CPUUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
    console.log(containerLeft)
    var highchartsToolbar = {title : '业务进程CPU使用率'}
    $("#CPUUsageToolbar" + index).html(templateModel(highchartsToolbar));
    $('#CPUUsage' + index).highcharts('StockChart', {
      chart: {
        animation: false,
        marginTop: 30
        },
        height : containerHeight,
        reflow: true,
        xAxis: {
          enabled: true
        },
        rangeSelector: {
            enabled: false
        },
        yAxis: {
          max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
          min: 0, // 设定y轴最小值
          minTickInterval: 0,
          tickAmount: 6, // 控制y轴标线的个数
          tickPixelInterval: 10, // 控制标线之间的中间间隔。
          title: {
            text: 'CPU 消耗（%）'
          },
          allowDecimals: false, // 是否显示小数。
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
        series: seriesData
        })
       var chart = $('#CPUUsage' + index).highcharts()
       chart.setSize($('#CPUUsageModel' +  index).width(), $('#CPUUsageModel' +  index).height() - toolbarHeight, false );
       console.log(screenWidth)
       $('#CPUUsageModel' + index).hide()
         //  $("#toobar").hide()
  }
  function TestUsageModel() {
    var initialData = initialDataGenerator()
    var seriesData = []
    for (var k = 0; k < 1; k++) {
      seriesData.push({
        name: 'Random data' + k,
        data: initialData,
        animation: false
      })
    }
    $('#TestUsageModel' +  index).css({'left' : containerLeft, 'top' : 0, 'width' : screenWidth + borderWidth, 'height' : containerHeight + borderWidth})
    console.log($('#TestUsageModel' +  index).width())
    var highchartsToolbar = {title : '未处理告警事件'}
    $("#TestUsageToolbar" + index).html(templateModel(highchartsToolbar));
    $('#TestUsage' + index).highcharts('StockChart', {
      chart: {
        animation: false,
        marginTop: 30
        },
        height : containerHeight,
        reflow: true,
        xAxis: {
          enabled: true
        },
        rangeSelector: {
            enabled: false
        },
        yAxis: {
          max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
          min: 0, // 设定y轴最小值
          minTickInterval: 0,
          tickAmount: 6, // 控制y轴标线的个数
          tickPixelInterval: 10, // 控制标线之间的中间间隔。
          title: {
            text: 'CPU 消耗（%）'
          },
          allowDecimals: false, // 是否显示小数。
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
        series: seriesData
        })
       var chart = $('#TestUsage' + index).highcharts()
       chart.setSize($('#TestUsageModel' +  index).width(), $('#TestUsageModel' +  index).height() - toolbarHeight, false );
      //  console.log(screenWidth)
       $('#TestUsageModel' + index).hide()
         //  $("#toobar").hide()
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
function beginReceiveData() {

}
function stopReceiveData() {

}
module.exports.setup = setup
module.exports.beginReceiveData = beginReceiveData
module.exports.stopReceiveData = stopReceiveData
