# var setup = function () {
# var html = '<div>\
#        <div><button class="k-button" id="collapseAllNodes">Collapse</button>\
#         <button class="k-button" id="addUpdate">增 量 更 新</button></div>\
#        <label style = "font-weight:bold" for=\'search-term\'>Search : </label>\
#        <input type=text id = \'search-term\' placeholder = \'I am looking for...\'/></div>\
#        <ul id="menu">\
#        <li id="rename"><i class="fa fa-coffee"></i> Rename</li>\
#   <li id="delete"><i class="fa fa-times"></i>  Delete</li>\
#   </ul>'
# $('.filterText').append(html)
# $('.MonitorObjectListPanel').css('min-width', '200px')// 设置treeview窗口的最小宽度
# var divHeight = 90
# var windowHeight = window.innerHeight
# var actHeight = windowHeight - divHeight - 40
# $('#MonitorObjectListPanel-Treeview').height(actHeight)// 设置treeview窗口的高度
# $(window).resize(function() {// 根据窗口大小自动调整treeview窗口高度
#  //process here
#   windowHeight = window.innerHeight
#   divHeight = $('#BeforeTreeview').height()
#   var resizeHeight = windowHeight - divHeight - 40
#   $( '#MonitorObjectListPanel-Treeview').height(resizeHeight)// 设置treeview窗口的高度
# });
# }
#///////////////////////////////////////////////////////////这些代码为了实现横向滚动条位置跟随treeview高度变化////////////////////////
# function adjustSize() {
#   var windowHeight = window.innerHeight
#   var treeviewHeight = $('#MonitorObjectListPanel-Treeview .k-treeview-lines').height() // 获取treeview的实际高度
# //  console.log('treeviewHeight : ' + treeviewHeight)
# //  console.log($('.k-treeview-lines'))
#    divHeight = $('#BeforeTreeview').height()
#   // console.log(divHeight )
#   var resizeHeight = windowHeight > treeviewHeight ? treeviewHeight : windowHeight - divHeight -20
#   $('.tree-view-scroller').height(resizeHeight)// 设置treeview窗口的高度
# }
# $(window).resize(function() {
#    adjustSize()
# })
# $('#MonitorObjectListPanel-Treeview .k-treeview-lines').resize(function() {// 根据窗口大小自动调整treeview窗口高度
#  //process here
#  adjustSize()
#  // console.log('resize')
#   // var windowHeight = window.innerHeight
#   // var treeviewHeight = $('#MonitorObjectListPanel-Treeview .k-treeview-lines').height()
#   // console.log('treeviewHeight : ' + treeviewHeight)
#   // console.log($('.k-treeview-lines'))
#   // // divHeight = $('#BeforeTreeview').height()
#   // // console.log(divHeight )
#   // var resizeHeight = windowHeight - divHeight -20
#   // $('.tree-view-scroller').height(resizeHeight)// 设置treeview窗口的高度
# });
#///////////////////////////////////////////////////////////以上代码///////////////////////


treeview = null; #全局 treeview
beginReceiveData = (@TreeviewList, @menu)->
  treeViewNode = @TreeviewList
  treeview = $(treeViewNode).kendoTreeView(
    template: '<i class=\'#= item.FrontAwesomeClass #\'></i>#=  item.text #'
    dragAndDrop: true
    animation: false
    loadOnDemand: false
    select: onSelect
    change: (e) ->
  ).data('kendoTreeView')
  console.log 'begin receive data'
  MenuNode = @menu
  $(MenuNode).kendoContextMenu
    target: treeViewNode
    filter: '.k-in'
    select: treeSelect
  reqMonitorObjectTopicData = new userApiStruct.CShfeFtdcReqQryMonitorObjectField()
  ReqQryMonitorObjectTopicField = {}
  ReqQryMonitorObjectTopicField.reqObject = reqMonitorObjectTopicData
  ReqQryMonitorObjectTopicField.RequestId = ++ window.ReqQryMonitorObjectTopicRequestID
  ReqQryMonitorObjectTopicField.rspMessage =  EVENTS.RspQryMonitorObjectTopic + ReqQryMonitorObjectTopicField.RequestId

  netMonitorAttrerScope               = new userApiStruct.CShfeFtdcReqQryNetMonitorAttrScopeField()
  netMonitorAttrerScope.OperationType = 0;
  netMonitorAttrerScope.ID            = 0;
  netMonitorAttrerScope.CName         = " ";
  netMonitorAttrerScope.EName         = " ";
  netMonitorAttrerScope.Comments      = " ";

  netMonitorAttrerScopeField4            = {}
  netMonitorAttrerScopeField4.reqObject  = netMonitorAttrerScope
  netMonitorAttrerScopeField4.RequestId  = ++window.ReqQryNetMonitorAttrScopeTopicRequestID;
  netMonitorAttrerScopeField4.rspMessage = EVENTS.RspQryNetMonitorAttrScopeTopic + netMonitorAttrerScopeField4.RequestId

  userApi.emitter.on EVENTS.RspQyrUserLoginSucceed, (data) =>
    console.log 'Login in'
    userApi.emitter.emit EVENTS.ReqQryMonitorObjectTopic, ReqQryMonitorObjectTopicField

    userApi.emitter.emit EVENTS.ReqQryNetMonitorAttrScopeTopic, netMonitorAttrerScopeField4

    userApi.emitter.on netMonitorAttrerScopeField4.rspMessage, (data) =>
      console.log netMonitorAttrerScopeField4.rspMessage
      console.log data

  treeviewData1 = []  # 后台传递的原始数据
  userApi.emitter.on ReqQryMonitorObjectTopicField.rspMessage, (data) ->
    treeviewData1.push data.pRspQryMonitorObject
    if data.bIsLast == true #所有数据传输
      treeviewData = arrayConverseToJson(treeviewData1)
      sortData treeviewData
      # 对treeview节点按名字进行排序
      treeview.setDataSource new (kendo.data.HierarchicalDataSource)(data: treeviewData)
    #        var dataSource=treeview.dataSource
    #
    #        dataSource.add({
    #            "text": "testData",
    #            curID: "test"
    #        })
    # //////用于测试节点图标状态改变
    # var time = 0
    # var dataItem = treeview.dataSource.data()[0] // 获取第一组数据的根节点
    # setInterval(function () {
    #     time ++
    #     if (time%2 === 0) {
    #       dataItem.set("FrontAwesomeClass", WarningType(1))
    #     } else {
    #       dataItem.set("FrontAwesomeClass", WarningType(0))
    #     }
    # },2000)
    return
  arrayLeft = 0
  # 所检索到的text剩余个数
  inputValue = ''
  searchArray = []
  # 检索到的text
  $('#search-term').keyup (event) ->
    keyCode = event.which
    itemScrollTop = 0
    term = @value.toUpperCase()
    tlen = term.length
    # var beginDate = Date.now()
    if keyCode == 13 and $.trim($(this).val()) != inputValue
      searchArray = []
      #  如果查询内容改变， 则设其为0，重新查找
      inputValue = $.trim($(this).val())
      $('.k-in .highlight').each ->
        # 选出所有k-in类下具有highlight 类属性的节点
        # $(this).parent().text($(this).parent().text()); // 原代码
        $(this).removeClass 'highlight'
        # 移除之前搜索的节点highlight属性
        return
      # ignore if no search term
      if $.trim($(this).val()) == ''
        return
      $('#MonitorObjectListPanel-Treeview span.k-in').each (index) ->
        # console.log('classList: ' + this.firstChild.classList)
        text = $(this).text()
        warningClassName = ''
        if @firstChild.classList != undefined
          classLength = @firstChild.classList.length
          i = 0
          while i < classLength
            if @firstChild.classList[i] == 'fa'
              warningClassName = @firstChild.classList[i] + ' ' + @firstChild.classList[i + 1]
              # 获取class属性
              break
            i++
        html = ''
        q = 0
        if (p = text.toUpperCase().indexOf(term, q)) >= 0
          html += '<span class = "' + warningClassName + '">' + text.substring(q, p) + '<span class = "highlight">' + text.substr(p, tlen) + '</span>' + '</span>'
          # 高亮查找的元素，并且保持其类属性
          #  html += text.substring(q,p) + '<span class="highlight ' +  WarningType(1) + '" >'+ text.substr(p,tlen) + '</span>'
          q = p + tlen
        if q > 0
          html += text.substring(q)
          $(this).html html
          # treeview.expand($(this))
          $(this).parentsUntil('.k-treeview', '.k-item').each (index, element) ->
            treeview.expand $(this)
            # 展开所有符合的元素
            $(this).data 'search', term
            # 把term数据添加到 this元素中，标记该数据符合要求
            return
        return
      $('.highlight').each ->
        # 将查询到的节点 加入数组中
        searchArray.push this
        return
      if searchArray.length == 0
        return
      # 节点中没有查询的内容
      $('html, body, .k-treeview').animate { scrollTop: searchArray[0].offsetTop }, 0
      # 0表示滚动的时间，默认为400
      treeview.select $(searchArray[0])
      arrayLeft = searchArray.length - 1
      # $('#treeview .k-item').each(function() {
      # if ($(this).data('search') != term) { //选出不符合要求的元毒
      # treeview.collapse($(this)); // 折叠所有不符合的元素
      # }
      # })
    else if keyCode == 13 and $.trim($(this).val()) == inputValue and searchArray.length > 1
      # 如果查询内容不变且结果不止一个， 则按下enter之后继续显示该结果
      $('#MonitorObjectListPanel-Treeview .k-item').each (index) ->
        # 这个是为了解决查找过程中折叠或者展开了某个节点时继续查找时出错的问题
        if $(this).data('search') == term
          # 如果某个节点被标记过，将其展开
          $(this).parentsUntil('.k-treeview', '.k-item').each (index, element) ->
            treeview.expand $(this)
            # 展开所有符合的元素
            return
        return
      itemScrollTop = searchArray[searchArray.length - arrayLeft].offsetTop
      parentNode = searchArray[searchArray.length - arrayLeft].offsetParent
      parentOffsetTop = parentNode.offsetTop
      while parentNode.offsetParent != null
        itemScrollTop += parentOffsetTop
        parentNode = parentNode.offsetParent
        parentOffsetTop = parentNode.offsetTop
      treeview.select $(searchArray[searchArray.length - arrayLeft])
      $('html, body, .k-treeview').animate { scrollTop: itemScrollTop - ($('.tree-view-resizer').height() * 0.25) }, 0
      # 0表示滚动的时间，默认为400
      arrayLeft--
      if arrayLeft == 0
        arrayLeft = searchArray.length
    else
    return
  $('#collapseAllNodes').click ->
    treeview.collapse '.k-item'
    return

  removeNode = (text) ->
    foo = treeview.findByText(text)
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都插入data
        treeview.remove $(foo[i])
        # the second param : referenceNode jQuery
        i++
    return

  updateNode = (data, text) ->
    foo = treeview.findByText(text)
    # return jquery nodes
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都更新其值
        fooNode = treeview.dataItem(foo[i])
        console.log 'updata here'
        fooNode.set 'text', data.text
        fooNode.set 'FrontAwesomeClass', data.FrontAwesomeClass
        i++
    else
    return

  insertNode = (data, text, bool) ->
    foo = treeview.findByText(text)
    # return jquery nodes
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都插入data
        if bool == true
          treeview.insertBefore data, $(foo[i])
          # the second param : referenceNode jQuery
        else
          treeview.insertAfter data, $(foo[i])
        i++
    else
      # 如果查找不到节点text，则直接插到数组末尾
      dataSource = treeview.dataSource
      dataSource.pushCreate data
    return

  addUpdate = (jsonData) ->
    addLength = jsonData.add.length
    if addLength >= 0
      i = 0
      while i < addLength
        insertNode jsonData.add[i].data, jsonData.add[i].text, jsonData.add[i].before
        i++
    deleteLength = jsonData.delete.length
    if deleteLength >= 0
      i = 0
      while i < addLength
        removeNode jsonData.delete[i].text
        i++
    updateLength = jsonData.update.length
    if updateLength >= 0
      i = 0
      while i < addLength
        updateNode jsonData.update[i].data, jsonData.update[i].text
        i++
    return

  $('#addUpdate').click ->
    addData = [ {
      text: 'addData'
      'FrontAwesomeClass': 'fa fa-bell'
      items: [ {
        text: '处理器'
        'FrontAwesomeClass': 'fa fa-bell'
      } ]
    } ]
    addText = 'TMS_[实时监控系统]'
    deleteText = 'app'
    updateData =
      text: 'update Text'
      'FrontAwesomeClass': 'fa fa-bell-slash'
      items: [ {
        text: '处理器'
        'FrontAwesomeClass': 'fa fa-bell'
      } ]
    updateText = 'exception!'
    jsonData =
      'add': [ {
        'data': addData
        'text': addText
        'before': true
      } ]
      'delete': [ { 'text': deleteText } ]
      'update': [ {
        'data': updateData
        'text': updateText
      } ]
    addUpdate jsonData
    return
  return

WarningType = (value) ->
  if value == 0
    'fa fa-bell'
  else if value == 1
    'fa fa-bell-o'
  else
    'fa fa-bell-slash'

osLeafNodeData = [
  {
    'text': '处理器'
    items: null
  }
  {
    'text': '磁盘IO'
    items: null
  }
  {
    'text': '告警'
    items: null
  }
  {
    'text': '关键文件'
    items: null
  }
  {
    'text': '进程'
    items: null
  }
  {
    'text': '路由信息'
    items: null
  }
  {
    'text': '内存'
    items: null
  }
  {
    'text': '日志'
    items: null
  }
  {
    'text': '网络'
    items: null
  }
  {
    'text': '文件系统'
    items: null
  }
  {
    'text': '系统配置'
    items: null
  }
  {
    'text': '系统状态'
    items: null
  }
  {
    'text': '性能指标'
    items: null
  }
  {
    'text': '用户'
    items: null
  }
]
# rst 在当前rst数组中查找
# idArray split之后的数组
# idx 当前在idArray中查找的位置
# tracePath 在整个finalRst中对应的路径
# searchNode，在rst数值中查找由idArray和idx确定的finalRst的索引路径，结果输出到tracePath中。

searchNode = (idArray, idx, rst, tracePath) ->
  if idx == idArray.length + 1
    return true
  i = 0
  while i < rst.length
    if idArray[idx] == rst[i].curID
      tracePath.push i
      #            if(rst[i].items===null){
      #                rst[i].items=[]
      #            }
      # if rst[i].items == null
      # ##   注册uri
      #   uri = 'atom://gridDemo' + rst[i].text
      #   # console.log uri
      # atom.workspace.addOpener (uri) ->
      #   # console.log 'addopen'
      #   creatGridDemo uri
      searchResult = searchNode(idArray, ++idx, rst[i].items, tracePath)
      return searchResult
    i++
  false

process = (data, finalRst) ->
  idArray = data.ObjectID.split('.')
  idArrayLength = idArray.length
  tracePath = []
  idx = 0
  searchResult = searchNode(idArray, idx, finalRst, tracePath)
  distance = Math.abs(idArrayLength - (tracePath.length))
  itemsArray = finalRst
  if searchResult == false
    i = 0
    while i < tracePath.length
      itemsArray = itemsArray[tracePath[i]].items
      i++
    itemsArray.push
      'text': if distance > 1 then 'exception!' else data.ObjectName
      'curID': idArray[tracePath.length]
      'FrontAwesomeClass': WarningType(data.WarningActive)
      'items': if idArray[idArrayLength - 2] == 'os' then osLeafNodeData else []
    if distance > 1
      process data, finalRst
  else
    # searchResult=true表示如果有相同的ID节点，怎么处理
    i = 0
    while i < tracePath.length - 1
      itemsArray = itemsArray[tracePath[i]].items
      i++
    itemsArray.push
      'text': if distance > 1 then 'exception!' else data.ObjectName
      curID: idArray[tracePath.length]
      items: null
    if distance > 1
      process data, finalRst
  return

arrayConverseToJson = (data) ->
  finalRst = []
  dataLenth = data.length
  i = 0
  while i < dataLenth
    # 遍历整个data
    process data[i], finalRst
    i++
  finalRst
treeSelect = (e) ->
  # event data
  # e.item : the selected item
  # e.type : type is "select"
  # e.target : the current target of the contentmenu - the current element
  # var dataItem = treeview.dataItem(e.target);//dataItem 获取该节点信息，返回的数据格式为kendo.data.Node
  # console.log(treeview.dataItem(e.target))
  if typeof e != 'object'
    return
  switch e.item.id
    when 'rename'
      console.log 'rename'
      renameNode e.target
    when 'delete'
      treeview.remove e.target
  return

renameNode = (nodeJquery) ->
  # 通过atom的 Panel 改变节点的text值
  para = document.createElement('input')
  # Create a <input> element
  para.classList.add 'native-key-bindings'
  node = treeview.dataItem(nodeJquery)
  newId = 'newName'
  para.id = newId
  para.autofocus = true
  para.type = 'text'
  console.log para
  option =
    'item': para
    'visible': true
    'priority': 400
  atom.workspace.addModalPanel option # addModalPanel貌似被workspace 禁掉了
  $('#' + newId).keyup (event) ->
    if event.keyCode == 13
      # Enter 键码
      newName = $('#' + newId).val()
      node.set 'text', newName
      # set the value of the specified field
      atom.workspace.addModalPanel
        'item': para
        'visible': false
        'priority': 100
      para.parentNode.removeChild this
      # 删除该节点
    return
  return


byName = (name) ->
  (o, p) ->
    a = undefined
    b = undefined
    if typeof o == 'object' and typeof p == 'object' and o and p
      a = o[name]
      b = p[name]
      if a == b
        return 0
      if typeof a == typeof b
        return if a < b then -1 else 1
      return if typeof a < typeof b then -1 else 1
    else
      throw 'error'
    return

sortNew = (data) ->
  if data.items == null
    return
  i = 0
  while i < data.items.length
    data.items.sort byName('text')
    sortNew data.items[i]
    i++
  return

sortData = (data) ->
  i = 0
  while i < data.length
    data.sort byName('text')
    sortNew data[i]
    i++
  return

# module.exports.setup = setup

creatGridDemo = (state) ->
  console.log 'creatGridDemo'

  Demo = require('./gridDemoView.coffee')
  p = new Demo(state)
  # p.getTitle()
# var treeview = $('#MonitorObjectListPanel-Treeview').kendoTreeView({
#   template: "<i class='#= item.FrontAwesomeClass #'></i>#=  item.text #", // 格式很重要~
#   dragAndDrop: true,
#   animation: false,
#   loadOnDemand: false, // 默认为true
#   select: onSelect,
#   change: function (e) {}
# }).data('kendoTreeView')
onSelect = (e) ->
  dataItem = treeview.dataItem(e.node)
  # console.log('items' in dataItem)
  # console.log(dataItem.hasOwnProperty(length))
  if 'items' of dataItem == false or dataItem.items.length == 0
    # 判断是否叶子节点
    # 打开url
    # i ++
    uri = 'atom://gridViewDemo' + dataItem.text
    # uri = 'atom://gridViewDemo' + dataItem.text
    # console.log 'open uri'
    # atom.workspace.addOpener (uri) ->
    #   console.log 'addopen!!!!!!'
    #   creatGridDemo uri
    atom.workspace.open uri
    # console.log 'hha'
  return

module.exports.beginReceiveData = beginReceiveData

# ---
# generated by js2coffee 2.2.0
