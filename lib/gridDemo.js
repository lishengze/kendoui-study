_ = require('underscore-plus')
function setup() {
  var html = '<div class = "leftContainer"><div id = "gridOne"> </div></div>'
  $('#iframe').append(html)
  $('#gridOne').height(window.innerHeight - 100)
  $(window).resize(function() {// 根据窗口大小自动调整treeview窗口高度
   //process here
    windowHeight = window.innerHeight
    var resizeHeight = windowHeight -100
    $( '#gridOne').height(resizeHeight)// 设置treeview窗口的高度
  });
  var gridOnedata = {title : 'haha' }
  var templateModel = kendo.template("<strong style = 'color:indianred'>#: title #  </strong>\
                    <i id = 'gridMax' class = 'gridMax fa fa-clone'></i>\
                    <i id = 'gridClose' class = ' gridClose fa fa-times'></i>")
  $('#gridOne').kendoGrid({
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
    dataSource: [{'指标名称':'对象是否活跃标示','指标ID':'Active'},
            {'指标名称':'日志事件','指标ID':'SyslogEvent'},
            {'指标名称':'已处理告警事件','指标ID':'ProcessedEvent'},
            {'指标名称':'业务进程所在文件系统使用率','指标ID':'DisUsage'},
            {'指标名称':'业务进程CPU使用率','指标ID':'CPUUsage'},
            {'指标名称':'未处理告警事件','指标ID':'UnprocessdEvent'}]
  })
  function onChange() {
    var selectedRows = this.select();
    var dataItem = this.dataItem(selectedRows)
    switch (selectedRows[0].textContent) {
      case '日志事件':
      case 'SyslogEvent':
        $('#rizhi').show()
        break
      case '对象是否活跃标示':
      case 'Active':
        SyslogEvent()
        break
      case '业务进程CPU使用率':
        $('#CPUUsageModel').show()
        break
      default:
   }
  };
  SyslogEvent()
  CPUUsage()
  // 鼠标响应事件
  var gridWidth  = 0
  var gridHeight = 0
  var gridPostion = {}
  var i = 0
  var zIndex = 0
  var chart =  $('#CPUUsage').highcharts()

  function resizeWindow(node) {
    var nodeMaxWidth = $('.baobiaoContainer').width() - 10
    var nodeMaxHeight = window.innerHeight - 50
    var nodeRight = window.pageYOffset + $('.tab-bar').height()
    $(node).css('z-index', ++ zIndex)
    if (i % 2 === 1) {
      gridPostion =  $(node).position()
      gridWidth = $(node).width()
      gridHeight = $(node).height()
    }
    if(nodeMaxWidth !==  $(node).width()) {
      $(node).css({ "left": 0, "top": 0 })
      $(node).width(nodeMaxWidth)
      $(node).height(nodeMaxHeight)
      if (node[0].id === 'CPUUsageModel') {
        chart.setSize(nodeMaxWidth - 20, nodeMaxHeight - 30, false );
      }
     } else {
       $(node).css({ "left": gridPostion.left, "top": gridPostion.top })
       $(node).width(gridWidth)
       $(node).height(gridHeight)
       if (node[0].id === 'CPUUsageModel') {
         chart.setSize(gridWidth, gridHeight, false );
       }
    }
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
    resizeWindow(node)
   })
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
  $('#CPUUsageModel').resizable({
     // On resize, set the chart size to that of the
     // resizer minus padding. If your chart has a lot of data or other
     // content, the redrawing might be slow. In that case, we recommend
     // that you use the 'stop' event instead of 'resize'.
     resize: function() {
         chart.setSize(
             $(this).width() - 20,
             $(this).height() - 20,
             false
         );
     }
  });

  function SyslogEvent() {
    var gridrizhidata ={title : '日志事件' }
    $('#rizhi').kendoGrid({
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
    $('#rizhi').hide()
  }
  function CPUUsage() {
    var initialDataGenerator = function () { // 构建初始随机值
      var Mydata = []
      var time = (new Date()).getTime()
      var i
      for (i = -100002; i <= 0; i += 1) {
        Mydata.push([
          time + i * 1000,
          Math.ceil(Math.random() * 100)
        ])
      }
      return Mydata
    }
    var initialData = initialDataGenerator()
    var seriesData = []
    for (var k = 0; k < 1; k++) {
      seriesData.push({
        name: 'Random data' + k,
        data: initialData,
        animation: false
      })
    }
    var highchartsToolbar = {title : '业务进程CPU使用率'}
    $("#toolbar").html(templateModel(highchartsToolbar));
    $('#CPUUsage').highcharts('StockChart', {
      chart: {
        animation: false,
        marginTop: 30
        },
        xAxis: {
          enabled: true
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
      $('#CPUUsageModel').hide()
         //  $("#toobar").hide()
  }
}
function beginReceiveData() {

}
function stopReceiveData() {

}
module.exports.setup = setup
module.exports.beginReceiveData = beginReceiveData
module.exports.stopReceiveData = stopReceiveData
