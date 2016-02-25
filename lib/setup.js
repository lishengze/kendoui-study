// $=require('atom-space-pen-views').$
var setup = function () {
  var html = '<div>\
         <div><button class="k-button" id="collapseAllNodes">Collapse</button>\
          <button class="k-button" id="addUpdate">增 量 更 新</button></div>\
         <label style = "font-weight:bold" for=\'search-term\'>Search : </label>\
         <input type=text id = \'search-term\' placeholder = \'I am looking for...\'/></div>\
         <ul id="menu">\
         <li id="rename"><i class="fa fa-coffee"></i> Rename</li>\
    <li id="delete"><i class="fa fa-times"></i>  Delete</li>\
    </ul>'
  $('.filterText').append(html)
  // console.log($('#MonitorObjectListPanel').height())
  $('.MonitorObjectListPanel').css('min-width', '200px')// 设置treeview窗口的最小宽度
  var divHeight = 90
  // $('#BeforeTreeview').height(divHeight)// 设置treeview上面button和input元素的大小
  var windowHeight = window.innerHeight
  var actHeight = windowHeight - divHeight - 40
  $('#MonitorObjectListPanel-Treeview').height(actHeight)// 设置treeview窗口的高度
  $(window).resize(function() {// 根据窗口大小自动调整treeview窗口高度
   //process here
    windowHeight = window.innerHeight
    divHeight = $('#BeforeTreeview').height()
    var resizeHeight = windowHeight - divHeight - 40
    $( '#MonitorObjectListPanel-Treeview').height(resizeHeight)// 设置treeview窗口的高度
  });
  /////////////////////////////////////////////////////////////这些代码为了实现横向滚动条位置跟随treeview高度变化////////////////////////
  // function adjustSize() {
  //   var windowHeight = window.innerHeight
  //   var treeviewHeight = $('#MonitorObjectListPanel-Treeview .k-treeview-lines').height() // 获取treeview的实际高度
  // //  console.log('treeviewHeight : ' + treeviewHeight)
  // //  console.log($('.k-treeview-lines'))
  //    divHeight = $('#BeforeTreeview').height()
  //   // console.log(divHeight )
  //   var resizeHeight = windowHeight > treeviewHeight ? treeviewHeight : windowHeight - divHeight -20
  //   $('.tree-view-scroller').height(resizeHeight)// 设置treeview窗口的高度
  // }
  // $(window).resize(function() {
  //    adjustSize()
  // })
  // $('#MonitorObjectListPanel-Treeview .k-treeview-lines').resize(function() {// 根据窗口大小自动调整treeview窗口高度
  //  //process here
  //  adjustSize()
  //  // console.log('resize')
  //   // var windowHeight = window.innerHeight
  //   // var treeviewHeight = $('#MonitorObjectListPanel-Treeview .k-treeview-lines').height()
  //   // console.log('treeviewHeight : ' + treeviewHeight)
  //   // console.log($('.k-treeview-lines'))
  //   // // divHeight = $('#BeforeTreeview').height()
  //   // // console.log(divHeight )
  //   // var resizeHeight = windowHeight - divHeight -20
  //   // $('.tree-view-scroller').height(resizeHeight)// 设置treeview窗口的高度
  // });
/////////////////////////////////////////////////////////////以上代码///////////////////////
//    var iconClass1="'fa fa-lightbulb-o'"
//    $("#MonitorObjectListPanel-Treeview").kendoTreeView({
//        template: "<i class=#= item.icon #></i>#= item.text # (#= item.inStock #)",
//        dataSource: [
//            { text: "foo", inStock: 7, icon: iconClass1 ,items:k [
//                { text: "bar", inStock: 2, ic\on: iconClass1 },
//                { text: "baz", inStock: 5, icon: iconClass1 }
//            ] }
//        ]
//    })
//    })
//   $("#MonitorObjectListPanel-Treeview").kendoTreeView({
//       dragAndDrop: true,
//        dataSource: [
//            {
//                id:"业务监控",
//                text: "TMS_[实时监控系统]",
//                items: [
//                    {
//                        id:"PuDian",
//                        text: "PuDian",
//                        items:[
//                            {
//                               id:"app",
//                               text:"app",
//                               items:[
//                                   {
//                                    id:"gate_mail",
//                                    text:"gate_mail"
//                                   }
//                               ]
//                            },
//                            {
//                               id:"os",
//                               text:"os"
//                            }
//                        ]
//                    }
//                ]
//            },
//            {
//                text: "我的视图"
//            },
//            {
//                text: "我的列表"
//            },
//            {
//                text: "会员接入信息"
//            },
//            {
//                text: "报单响应趋势图"
//            },
//            {
//                text: "会员席位交易趋势图"
//            },
//            {
//                text:"疑似程序化交易监控"
//            }
//
//        ],
//       select:onSelect
//    })
//    })
}
function onSelect (e) {
  // `this` refers to the TreeView object
  var dataItem = this.dataItem(e.node)
  console.log('Selected node with id=' + dataItem.id)
  switch (dataItem.id) {
    case 'gate_mail':
      atom.workspace.open('atom://highStockDemo')
      break
    default:
      atom.workspace.open('atom://gridViewDemo')
      break
  }
}
var WarningType = function (value) {
  if (value === 0) return 'fa fa-bell'
  else if (value === 1) return 'fa fa-bell-o'
  else return 'fa fa-bell-slash'
}
// var finalRst = []

// rst 在当前rst数组中查找
// idArray split之后的数组
// idx 当前在idArray中查找的位置
// tracePath 在整个finalRst中对应的路径
// searchNode，在rst数值中查找由idArray和idx确定的finalRst的索引路径，结果输出到tracePath中。
var searchNode = function (idArray, idx, rst, tracePath) {
  if (idx === idArray.length + 1) {
    return true
  }
  for (var i = 0; i < rst.length; i++) {
    if (idArray[idx] === rst[i].curID) {
      tracePath.push(i)
      //            if(rst[i].items===null){
      //                rst[i].items=[]
      //            }
      var searchResult = searchNode(idArray, ++idx, rst[i].items, tracePath)
      return searchResult
    }
  }
  return false
}
var osLeafNodeData = [
  {
    'text': '处理器',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '磁盘IO',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '告警',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '关键文件',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '进程',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '路由信息',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '内存',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '日志',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '网络',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '文件系统',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '系统配置',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '系统状态',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '性能指标',
    // curID: idArray[tracePath.length],
    items: null
  }, {
    'text': '用户',
    // curID: idArray[tracePath.length],
    items: null
  }

]

var process = function (data, finalRst) {
  var idArray = data.ObjectID.split('.')
  var idArrayLength = idArray.length
  var tracePath = []
  var idx = 0
  var searchResult = searchNode(idArray, idx, finalRst, tracePath)
  var distance = Math.abs(idArrayLength - tracePath.length)
  var itemsArray = finalRst
  if (searchResult === false) {
    for (var i = 0; i < tracePath.length; i++) {
      itemsArray = itemsArray[tracePath[i]].items
    }
    itemsArray.push(
      {
        'text': distance > 1 ? 'exception!' : data.ObjectName,
        'curID': idArray[tracePath.length],
        'FrontAwesomeClass': WarningType(data.WarningActive),
        'items': idArray[idArrayLength - 2] === 'os' ? osLeafNodeData : []
      }
    )
    if (distance > 1) {
      process(data, finalRst)
    }
  } else { // searchResult=true表示如果有相同的ID节点，怎么处理
    for (var i = 0; i < tracePath.length - 1; i++) {
      itemsArray = itemsArray[tracePath[i]].items
    }
    itemsArray.push({
      'text': distance > 1 ? 'exception!' : data.ObjectName,
      curID: idArray[tracePath.length],
      // data: data,
      items: null
    }
    )
    if (distance > 1) {
      process(data, finalRst)
    }
  }
}
var arrayConverseToJson = function (data) {
  var finalRst = []
  var dataLenth = data.length
  for (var i = 0; i < dataLenth; i++) { // 遍历整个data
    process(data[i], finalRst)
  }
  return finalRst
}

var treeview = $('#MonitorObjectListPanel-Treeview').kendoTreeView({
  template: "<i class='#= item.FrontAwesomeClass #'></i>#=  item.text #", // 格式很重要~
  dragAndDrop: true,
  animation: false,
  loadOnDemand: false, // 默认为true
  change: function (e) {}
}).data('kendoTreeView')
var renameNode = function (nodeJquery) { // 通过atom的 Panel 改变节点的text值
  var para = document.createElement('input') // Create a <input> element
  para.classList.add('native-key-bindings')
  // parentNode.appendChild(para)
  // console.log(parentNode)
  var node = treeview.dataItem(nodeJquery)
  var newId = 'newName'
  para.id = newId
  para.autofocus = true
  para.type = 'text'
  var option = {
    'item': para,
    'visible': true,
    'priority': 100
  }
  atom.workspace.addModalPanel(option)
  $('#' + newId).keyup(function (event) {
    if (event.keyCode === 13) { // Enter 键码
      var newName = $('#' + newId).val()
      node.set('text', newName) // set the value of the specified field
      // treeview.text(node, newName)
      atom.workspace.addModalPanel({
        'item': para,
        'visible': false,
        'priority': 100
      })
      para.parentNode.removeChild(this) // 删除该节点
    }
  })
}
var treeSelect = function (e) {
  // event data
  // e.item : the selected item
  // e.type : type is "select"
  // e.target : the current target of the contentmenu - the current element
  // var dataItem = treeview.dataItem(e.target);//dataItem 获取该节点信息，返回的数据格式为kendo.data.Node
  console.log(treeview.dataItem(e.target))
  if (typeof e !== 'object') return
  switch (e.item.id) {
    case 'rename' :
      renameNode(e.target)
      break;
    case 'delete' :
      treeview.remove(e.target)
      break;
  }
// if (e.item.id === 'rename') {
//   renameNode(e.target)
// } else if (e.item.id === 'delete') {
//   treeview.remove(e.target)
// }
// treeview.text(e.target,"gogogo")
}
var io = require('socket.io-client')
var beginReceiveData = function () {
  $('#menu').kendoContextMenu({
    target: '#MonitorObjectListPanel-Treeview',
    filter: '.k-in',
    select: treeSelect
  })
  // var url = 'https://172.1.128.169:8000'
  var url = 'https://localhost:8000'
  rootSocket = io.connect(url, {secure: true})
  console.log('FrontConnected!!')
  rootSocket.emit('ReqQryMonitorObjectTopic')

  rootSocket.on('ReqQryMonitorObjectTopic CallbackData', function (data) {
    console.log('ReqQryMonitorObjectTopic CallbackData got!!')
    // var start = Date.now()
    var treeviewData = arrayConverseToJson(data)
    sortData(treeviewData) // 对treeview节点按名字进行排序
    //  console.log(Date.now() - start)
    //        var template=kendo.template("<i class='fa fa-lightbulb-o'></i>  #= item.text #")
    treeview.setDataSource(new kendo.data.HierarchicalDataSource({
      data: treeviewData
    }))
  //        var dataSource=treeview.dataSource
  //
  //        dataSource.add({
  //            "text": "testData",
  //            curID: "test"
  //        })
  // //////用于测试节点图标状态改变
  // var time = 0
  // var dataItem = treeview.dataSource.data()[0] // 获取第一组数据的根节点
  // setInterval(function () {
  //     time ++
  //     if (time%2 === 0) {
  //       dataItem.set("FrontAwesomeClass", WarningType(1))
  //     } else {
  //       dataItem.set("FrontAwesomeClass", WarningType(0))
  //     }
  // },2000)
  })
  var arrayLeft = 0 // 所检索到的text剩余个数
  var inputValue = ''
  var searchArray = [] // 检索到的text
  $('#search-term').keyup(function (event) {
    var keyCode = event.which
    var itemScrollTop = 0
    var term = this.value.toUpperCase()
    var tlen = term.length
    // var beginDate = Date.now()
    if (keyCode === 13 && $.trim($(this).val()) !== inputValue) {
      searchArray = [] //  如果查询内容改变， 则设其为0，重新查找
      inputValue = $.trim($(this).val())
      $('.k-in .highlight').each(function () { // 选出所有k-in类下具有highlight 类属性的节点
        // $(this).parent().text($(this).parent().text()); // 原代码
        $(this).removeClass('highlight') // 移除之前搜索的节点highlight属性
      })
      // ignore if no search term
      if ($.trim($(this).val()) === '') { return }
      $('#MonitorObjectListPanel-Treeview span.k-in').each(function (index) {
        // console.log('classList: ' + this.firstChild.classList)
        var text = $(this).text()
        var warningClassName = ''
        if (this.firstChild.classList !== undefined) {
          var classLength = this.firstChild.classList.length
          for (var i = 0; i < classLength; i++) {
            if (this.firstChild.classList[i] === 'fa') {
              warningClassName = this.firstChild.classList[i] + ' ' + this.firstChild.classList[i + 1] // 获取class属性
              break
            }
          }
        }
        var html = ''
        var q = 0
        if ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
          html += '<span class = "' + warningClassName + '">' + text.substring(q, p) +
            '<span class = "highlight">' + text.substr(p, tlen) + '</span>' + '</span>' // 高亮查找的元素，并且保持其类属性
          //  html += text.substring(q,p) + '<span class="highlight ' +  WarningType(1) + '" >'+ text.substr(p,tlen) + '</span>'
          q = p + tlen
        }
        if (q > 0) {
          html += text.substring(q)
          $(this).html(html)
          // treeview.expand($(this))
          $(this).parentsUntil('.k-treeview', '.k-item').each(
            function (index, element) {
              treeview.expand($(this)) // 展开所有符合的元素
              $(this).data('search', term) // 把term数据添加到 this元素中，标记该数据符合要求
            }
          )
        }
      })
      $('.highlight').each(function () { // 将查询到的节点 加入数组中
        searchArray.push(this)
      })
      if (searchArray.length === 0) { return } // 节点中没有查询的内容
      $('html, body, .k-treeview').animate({ scrollTop: searchArray[0].offsetTop}, 0) // 0表示滚动的时间，默认为400
      treeview.select($(searchArray[0]))
      arrayLeft = searchArray.length - 1
    // $('#treeview .k-item').each(function() {
    // if ($(this).data('search') != term) { //选出不符合要求的元毒
    // treeview.collapse($(this)); // 折叠所有不符合的元素
    // }
    // })
    //  console.log('searching time: ' + (Date.now() - startTime))
    } else if (keyCode === 13 && $.trim($(this).val()) === inputValue && searchArray.length > 1) { // 如果查询内容不变且结果不止一个， 则按下enter之后继续显示该结果
      $('#MonitorObjectListPanel-Treeview .k-item').each(function (index) { // 这个是为了解决查找过程中折叠或者展开了某个节点时继续查找时出错的问题
        if ($(this).data('search') === term) { // 如果某个节点被标记过，将其展开
          $(this).parentsUntil('.k-treeview', '.k-item').each(
            function (index, element) {
              treeview.expand($(this)) // 展开所有符合的元素
            }
          )
        }
      })
      itemScrollTop = searchArray[searchArray.length - arrayLeft].offsetTop
      var parentNode = searchArray[searchArray.length - arrayLeft].offsetParent
      var parentOffsetTop = parentNode.offsetTop
      // console.log('pareentOffsetTop: ' + parentOffsetTop)
      // console.log((searchArray[searchArray.length - arrayLeft]))
      // console.log('parentClassList: ' + parentClassList)
      while (parentNode.offsetParent !== null) {
        itemScrollTop += parentOffsetTop
        parentNode = parentNode.offsetParent
        parentOffsetTop = parentNode.offsetTop
      }
      treeview.select($(searchArray[searchArray.length - arrayLeft]))
      $('html, body, .k-treeview').animate({ scrollTop: itemScrollTop - $('.tree-view-resizer').height() * 0.25}, 0) // 0表示滚动的时间，默认为400
      arrayLeft--
      if (arrayLeft === 0) {
        arrayLeft = searchArray.length
      }
    } else {}
  })
  $('#collapseAllNodes').click(function () {
    treeview.collapse('.k-item')
  })

  var removeNode = function (text) {
    var foo = treeview.findByText(text)
    if (foo.length !== 0) { // 如果找到该text
      for (var i = 0; i < foo.length; i++) { // 在查找到的每一个节点后都插入data
         treeview.remove($(foo[i])) // the second param : referenceNode jQuery
      }
    }
  }
  var updateNode = function (data, text) {
    var foo = treeview.findByText(text) // return jquery nodes
    if (foo.length !== 0) { // 如果找到该text
      for (var i = 0; i < foo.length; i++) { // 在查找到的每一个节点后都更新其值
        var fooNode = treeview.dataItem(foo[i])
        console.log('updata here')
        fooNode.set('text', data.text)
        fooNode.set('FrontAwesomeClass', data.FrontAwesomeClass)
      }
    } else {
   }
  }
  var insertNode = function (data, text, bool) {
    var foo = treeview.findByText(text) // return jquery nodes
    if (foo.length !== 0) { // 如果找到该text
      for (var i = 0; i < foo.length; i++) { // 在查找到的每一个节点后都插入data
        if (bool === true) {
          treeview.insertBefore(data, $(foo[i])) // the second param : referenceNode jQuery
        } else {
          treeview.insertAfter(data, $(foo[i]))
        }
      }
    } else { // 如果查找不到节点text，则直接插到数组末尾
      var dataSource = treeview.dataSource
      dataSource.pushCreate(data)
    }
  }
  var addUpdate = function (jsonData) {
    var addLength = jsonData.add.length
    if (addLength >= 0) {
      for (var i = 0; i < addLength; i ++){
        insertNode(jsonData.add[i].data, jsonData.add[i].text, jsonData.add[i].before)
      }
    }
    var deleteLength = jsonData.delete.length
    if (deleteLength >= 0) {
      for (var i = 0; i < addLength; i++){
        removeNode(jsonData.delete[i].text)
      }
    }
    var updateLength = jsonData.update.length
    if (updateLength >= 0) {
      for (var i = 0; i < addLength; i++){
        updateNode(jsonData.update[i].data, jsonData.update[i].text)
      }
    }
  }
  $('#addUpdate').click(function() {
    var addData = [{text: 'addData', 'FrontAwesomeClass': 'fa fa-bell', items: [{ text: '处理器', 'FrontAwesomeClass': 'fa fa-bell' }]}]
    var addText = 'TMS_[实时监控系统]'
    var deleteText = 'app'
    var updateData = {text: 'update Text', 'FrontAwesomeClass': 'fa fa-bell-slash', items: [{ text: '处理器', 'FrontAwesomeClass': 'fa fa-bell' }]}
    var updateText = 'exception!'
    var jsonData = { 'add' :[ {'data': addData , 'text' : addText, 'before': true }], 'delete' : [{'text': deleteText}], 'update' : [{ 'data': updateData, 'text': updateText}]}
    addUpdate(jsonData)
  })
}
var by = function (name) {
  return function (o, p) {
    var a
    var b
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name]
      b = p[name]
      if (a === b) {
        return 0
      }
      if (typeof a === typeof b) {
        return a < b ? -1 : 1
      }
      return typeof a < typeof b ? -1 : 1
    } else {
      throw ('error')
    }
  }
}
var sortNew = function (data) {
  if (data.items === null) {
    return
  }
  for (var i = 0; i < data.items.length; i++) {
    data.items.sort(by('text'))
    sortNew(data.items[i])
  }
}
var sortData = function (data) {
  for (var i = 0; i < data.length; i++) {
    data.sort(by('text'))
    sortNew(data[i])
  }
}

module.exports.setup = setup
module.exports.beginReceiveData = beginReceiveData
// module.exports.stopReceiveData=stopReceiveData
