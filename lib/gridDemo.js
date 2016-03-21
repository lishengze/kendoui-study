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

  // var move=false;//移动标记
  // var _x, _y;//鼠标离控件左上角的相对位置
  // $("#gridOne").mousedown(function(e){
  //   move=true;
  //   _x=e.pageX-parseInt($(this).css("left"));
  //   _y=e.pageY-parseInt($(this).css("top"));
  // });
  // $(document).mousemove(function(e){
  //   if(move){
  //     var x=e.pageX-_x;//控件左上角到屏幕左上角的相对位置
  //     var y=e.pageY-_y;
  //     $("#gridOne").css({"top":y,"left":x});
  //     $("#gridOne").css('z-index',1);
  //   }
  // }).mouseup(function(){
  //    move=false;
  //    $("#gridOne").css('z-index',0);
  // });
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
   // console.log(selectedRows)
   var dataItem = this.dataItem(selectedRows)
   // console.log(selectedRows[0])
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
$('.gridClose').click(function(e) {
  var node = $(this).parent().parent()
  $(node).hide()
})
var gridWidth  = 0
var gridHeight = 0
var gridPostion = {}
var i = 0
var zIndex = 0
var chart =  $('#CPUUsage').highcharts()
// var resizeWidth = window.innerWidth - $('.monitor-sidebar-view').
function resizeWindow(node) {
   $(node).css('z-index', ++ zIndex)
  if (i % 2 === 1) {
    gridPostion =  $(node).position()
    gridWidth = $(node).width()
    gridHeight = $(node).height()
  }
  if((window.innerWidth - 20 ) !==  $(node).width()) {
    $(node).css({ "left": window.pageXOffset + 300, "top": window.pageYOffset + $('.tab-bar').height() })
    $(node).width(window.innerWidth - 20)
    $(node).height(window.innerHeight - 3)
    if (node[0].id === 'CPUUsageModel') {
      chart.setSize(window.innerWidth - 80, window.innerHeight - 80, false );
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
$('.k-grid-toolbar').dblclick(function(e) {
  // alert($('.k-grid-toolbar')._data('events'))
  i ++
  var node = $(this).parent()
  resizeWindow(node)
})
$('.gridMax').click(function(e) {
  i ++
  var node = $(this).parent().parent()
  resizeWindow(node)
 })

$(".k-grid-toolbar").mousedown(function(e) {
  var node = $(this).parent()
  $(node).css('z-index', ++zIndex)
  iDiffX = e.pageX - $(this).offset().left;
  iDiffY = e.pageY - $(this).offset().top;
  $(document).mousemove(function (e) {
    $(node).css({ "left": (e.pageX - iDiffX  - 300), "top": (e.pageY - iDiffY - $('.tab-bar').height()) });
  })
})
$('.k-grid-toolbar').mouseup(function () {
  $(document).unbind("mousemove");
 //  $(document).unbind("click");
})

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



//
//   $('#gridOne').kendoGrid({
//     scrollable: false,
//     toolbar:'<p>指标列表</p>',
//     columns: [{
//       field: '指标名称',
//       title: '指标名称'
//     }, {
//       field: '指标ID',
//       title: '指标ID'
//     }
//     ],
//     change: onChange,
//     selectable: "multiple cell",
//     sortable: true,
//     dataSource: [{'指标名称':'对象是否活跃标示','指标ID':'Active'},
//              {'指标名称':'日志事件','指标ID':'SyslogEvent'},
//              {'指标名称':'已处理告警事件','指标ID':'ProcessedEvent'},
//              {'指标名称':'业务进程所在文件系统使用率','指标ID':'DisUsage'},
//              {'指标名称':'业务进程CPU使用率','指标ID':'CPUUsage'},
//              {'指标名称':'未处理告警事件','指标ID':'UnprocessdEvent'}]
//   })
//   $(".k-grid-toolbar").mousedown(function (e) {
//   iDiffX = e.pageX-parseInt($('#gridOne').css("left"));
//   iDiffY = e.pageY-parseInt($('#gridOne').css("top"));
//   $(document).mousemove(function (e) {
//     // console.log(e.pageX)
//     // console.log(iDiffX)
//     $("#gridOne").css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
//   })
// })
//
// $('.k-grid-toolbar').mouseup(function () {
//   $(document).unbind("mousemove");
// })
//   function onChange() {
//     // if () {
//       // console.log(e)
//       var selectedRows = this.select();
//       console.log(selectedRows)
//       var dataItem = this.dataItem(selectedRows)
//       console.log(selectedRows[0])
//       switch (selectedRows[0].textContent) {
//         case '日志事件':
//         case 'SyslogEvent':
//           SyslogEvent()
//           break
//         case '对象是否活跃标示':
//         case 'Active':
//           isActive()
//           break
//         case '业务进程CPU使用率':
//         case 'CPUUsage':
//           CPUUsage()
//           break
//         default:
//       }
//    };
// function isActive() {
//  var initialDataGenerator = function () { // 构建初始随机值
//   var Mydata = []
//     var time = (new Date()).getTime()
//     var i
//     for (i = -100200; i <= 0; i += 1) {
//       Mydata.push([
//         time + i * 1000,
//         Math.ceil(Math.random() * 10)
//       ])
//     }
//     return Mydata
//   }
//   var initialData = initialDataGenerator()
//   var seriesData = []
//   for (var k = 0; k < 1; k++) {
//     seriesData.push({
//       name: 'Random data' + k,
//       data: initialData,
//       animation: false
//     })
//   }
//         // Create the chart
//         $('#isActive').highcharts('StockChart', {
//             rangeSelector: {
//               enabled:false
//             },
//
//             yAxis: {
//               max: 101, // 控制Y轴最大值，设成101是为了能显示100的grid
//               min: 0, // 设定y轴最小值
//               minTickInterval: 0,
//               tickAmount: 6, // 控制y轴标线的个数
//               tickPixelInterval: 10, // 控制标线之间的中间间隔。
//               title: {
//                 text: 'CPU 消耗（%）'
//               },
//               allowDecimals: false, // 是否显示小数。
//               //                labels: {// 坐标轴标签
//               //                   // enabled: false
//               //                    step:1// 控制标签显示的间隔。也就是说每隔几个标线显示指示数字
//               //                },
//               opposite: false
//             },
//
//             title: {
//                 text: 'Hourly temperatures in Vik i Sogn, Norway, 2004-2010'
//             },
//
//             subtitle: {
//                 text: 'Built chart in ...' // dummy text to reserve space for dynamic subtitle
//             },
//             scrollbar: {
//               enabled: false
//             },
//             exporting: {
//               enabled :false
//             },
//             // plotOptions: {
//             //   series: {
//             //     dataGrouping: {
//             //       enabled: false
//             //     }
//             //   }
//             // },
//             rangeSelector: {
//               enabled:false
//             },
//
//             series: seriesData
//
//         });
//     }
// function CPUUsage() {
//   var initialDataGenerator = function () { // 构建初始随机值
//     var Mydata = []
//     var time = (new Date()).getTime()
//     var i
//     for (i = -100002; i <= 0; i += 1) {
//       Mydata.push([
//         time + i * 1000,
//         Math.ceil(Math.random() * 100)
//       ])
//     }
//     return Mydata
//   }
//   var initialData = initialDataGenerator()
//   var seriesData = []
//   for (var k = 0; k < 1; k++) {
//     seriesData.push({
//       name: 'Random data' + k,
//       data: initialData,
//       animation: false
//     })
//   }
//   $('#yewujincheng').highcharts('StockChart', {
//     chart: {
//       animation: false,
//       // width: LargeWidth * 0.22,
//       // height: LargeHeight * 0.24, // 设置其高度
//       marginTop: 30
//     // marginLeft:55
//     // margin:10  如果将margin设为0，那么将不显示X轴Y轴
//       },
//       // navigator: {
//       //   enabled: false,
//       //   adaptToUpdatedData: true,
//       //   margin: 10
//       // },
//       xAxis: {
//         enabled: true
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
//         //                labels: {// 坐标轴标签
//         //                   // enabled: false
//         //                    step:1// 控制标签显示的间隔。也就是说每隔几个标线显示指示数字
//         //                },
//         opposite: false
//       },
//       scrollbar: {
//         enabled: false
//       },
//       exporting: {
//         enabled :false
//       },
//       // plotOptions: {
//       //   series: {
//       //     dataGrouping: {
//       //       enabled: false
//       //     }
//       //   }
//       // },
//       // rangeSelector: {
//       //   enabled:false
//       // },
//       credits: {
//         enabled: false // 禁用版权信息
//       },
//       series: seriesData
//       })
// }
//
// function SyslogEvent() {
//   $('#rizhi').kendoGrid({
//     scrollable: false,
//     toolbar:'<h2>日志事件</h2>',
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
//     selectable: "multiple",
//     sortable: true,
//     dataSource:  [{'日期':'2016.3.8','时间':'15:21:22','告警级别':' 1级','事件名':'着火啦'},
//              {'日期':'2016.3.8','时间':'15:43:09','告警级别':' 3级','事件名':'失水了'},
//              {'日期':'2016.3.8','时间':'16:54:11','告警级别':' 1级','事件名':'贼来了'},
//              {'日期':'2016.3.8','时间':'17:14:22','告警级别':' 4级','事件名':'抢劫了'}
//             ]
//   })
// }
//
//  //  $("#baobiaoContainer1").kendoWindow({
//  //    actions: [ "Maximize", "Close" ],
//  //    title:'指标列表',
//  //    width:300,
//  //    height:600,
//  //    open: function() {
//  //      $('#gridOne').kendoGrid({
//  //        scrollable: false,
//  //        columns: [{
//  //          field: '指标名称',
//  //          title: '指标名称'
//  //        }, {
//  //          field: '指标ID',
//  //          title: '指标ID'
//  //        }
//  //        ],
//  //        sortable: true,
//  //        dataSource: {
//  //          data: [{'指标名称':'对象是否活跃标示','指标ID':'Active'},
//  //                 {'指标名称':'日志事件','指标ID':'SyslogEvent'},
//  //                 {'指标名称':'已处理告警事件','指标ID':'ProcessedEvent'},
//  //                 {'指标名称':'业务进程所在文件系统使用率','指标ID':'DisUsage'},
//  //                 {'指标名称':'业务进程CPU使用率','指标ID':'CPUUsage'},
//  //                 {'指标名称':'未处理告警事件','指标ID':'UnprocessdEvent'},
//  //                ]
//  //        }
//  //      })
//  //    }
//  // });
}
function beginReceiveData() {

}
function stopReceiveData() {

}
module.exports.setup = setup
module.exports.beginReceiveData = beginReceiveData
module.exports.stopReceiveData = stopReceiveData
