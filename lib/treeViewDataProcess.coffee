# @fileoverview:
#     设置TreeView的数据源，并注册打开gridView对应Panel的接口。
#     文件输出的api是setTreeViewData,其余的函数都附属于这个函数。
# @author:
#     创建: 李献魁
#     修改: 李晟泽  2016.12.07; 


# g_treeViewMapData 存储treeview, grid 属性指标数字字符串映射表, 将其挂载到window对象上。
# g_treeView: TreeView的引用对象，为了方便其他函数使用，将其设置为当前页面全局对象。
g_treeView = null; 
window.g_treeViewMapData = [];
g_treeViewMapData["ObjectIDNS"] = [];
g_treeViewMapData["DomainNS"] = [];
g_treeViewMapData["AttrName"] = [];

# setTreeViewData
# 功能: 设置treeView的组件内容;
# 实现: 先设置TreeView的组件属性，接着向后台请求数据;
#      然后对数据进行处理使其满足treeView插件的格式，最后将数据赋予treeView。
# @param {outlet} treeViewNode，指向页面上的TreeView元素段落节点，设置TreeView的句柄。
# @param {outlet} MenuNode, 指向页面上的menu元素标签，设置menu的句柄。
# @return {null}。
setTreeViewData = (treeViewNode, MenuNode) ->
  setTreeViewBasicPro(treeViewNode, MenuNode);
  initMonConfigMapData();
  
  monitor2ObjectInfo  = new SysUserApiStruct.CShfeFtdcReqQryMonitor2ObjectField();
  monitor2ObjectField = {}
  monitor2ObjectField.reqObject = monitor2ObjectInfo
  monitor2ObjectField.RequestId = ++window.ReqQryMonitor2ObjectTopicRequestID;
  monitor2ObjectField.rspMessage = EVENTS.RspQryMonitor2ObjectTopic + monitor2ObjectField.RequestId
  monitor2ObjectField.reqMessage = EVENTS.ReqQryMonitor2ObjectTopic

  userApi.emitter.on "AllMonConfigDataReceived", (data) =>
    console.log "AllMonConfigDataReceived"
    userApi.emitter.emit monitor2ObjectField.reqMessage, monitor2ObjectField

  orginalTreeViewData = []  
  userApi.emitter.on monitor2ObjectField.rspMessage, (data) ->
    pRspQryMonitor2Object = data.pRspQryMonitor2Object
    pRspQryMonitor2Object.ObjectID = g_treeViewMapData["ObjectIDNS"][pRspQryMonitor2Object.ObjectID];
    orginalTreeViewData.push data.pRspQryMonitor2Object

    if data.bIsLast == true 
      treeviewData = arrayConverseToJson(orginalTreeViewData)
      sortData treeviewData
      g_treeView.setDataSource new (kendo.data.HierarchicalDataSource)(data: treeviewData)
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
    #  beginDate = Date.now()
    if keyCode == 13 and $.trim($(this).val()) != inputValue
      searchArray = []
      #  如果查询内容改变， 则设其为0，重新查找
      inputValue = $.trim($(this).val())
      $('.k-in .highlight').each ->
        # 选出所有k-in类下具有highlight 类属性的节点
        # $(this).parent().text($(this).parent().text()); # 原代码
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
          # g_treeView.expand($(this))
          $(this).parentsUntil('.k-g_treeView', '.k-item').each (index, element) ->
            g_treeView.expand $(this)
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
      $('html, body, .k-g_treeView').animate { scrollTop: searchArray[0].offsetTop }, 0
      # 0表示滚动的时间，默认为400
      g_treeView.select $(searchArray[0])
      arrayLeft = searchArray.length - 1
      # $('#g_treeView .k-item').each(function() {
      # if ($(this).data('search') != term) { #选出不符合要求的元毒
      # g_treeView.collapse($(this)); # 折叠所有不符合的元素
      # }
      # })
    else if keyCode == 13 and $.trim($(this).val()) == inputValue and searchArray.length > 1
      # 如果查询内容不变且结果不止一个， 则按下enter之后继续显示该结果
      $('#MonitorObjectListPanel-Treeview .k-item').each (index) ->
        # 这个是为了解决查找过程中折叠或者展开了某个节点时继续查找时出错的问题
        if $(this).data('search') == term
          # 如果某个节点被标记过，将其展开
          $(this).parentsUntil('.k-g_treeView', '.k-item').each (index, element) ->
            g_treeView.expand $(this)
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
      g_treeView.select $(searchArray[searchArray.length - arrayLeft])
      $('html, body, .k-g_treeView').animate { scrollTop: itemScrollTop - ($('.tree-view-resizer').height() * 0.25) }, 0
      # 0表示滚动的时间，默认为400
      arrayLeft--
      if arrayLeft == 0
        arrayLeft = searchArray.length
    else
    return
  $('#collapseAllNodes').click ->
    g_treeView.collapse '.k-item'
    return

  removeNode = (text) ->
    foo = g_treeView.findByText(text)
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都插入data
        g_treeView.remove $(foo[i])
        # the second param : referenceNode jQuery
        i++
    return

  updateNode = (data, text) ->
    foo = g_treeView.findByText(text)
    # return jquery nodes
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都更新其值
        fooNode = g_treeView.dataItem(foo[i])
        console.log 'updata here'
        fooNode.set 'text', data.text
        fooNode.set 'FrontAwesomeClass', data.FrontAwesomeClass
        i++
    else
    return

  insertNode = (data, text, bool) ->
    foo = g_treeView.findByText(text)
    # return jquery nodes
    if foo.length != 0
      # 如果找到该text
      i = 0
      while i < foo.length
        # 在查找到的每一个节点后都插入data
        if bool == true
          g_treeView.insertBefore data, $(foo[i])
          # the second param : referenceNode jQuery
        else
          g_treeView.insertAfter data, $(foo[i])
        i++
    else
      # 如果查找不到节点text，则直接插到数组末尾
      dataSource = g_treeView.dataSource
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

# setTreeViewBasicPro
# 功能: 设置kendoTreeView 和 kendoContextMenu 的基本属性;
# @param {outlet} treeViewNode，指向页面上的TreeView元素段落节点，设置TreeView的句柄。
# @param {outlet} MenuNode, 指向页面上的menu元素标签，设置menu的句柄。
# @return {null}。
setTreeViewBasicPro = (treeViewNode, MenuNode) ->
    # treeViewNode = TreeviewList
    g_treeView = $(treeViewNode).kendoTreeView(
      template: '<i class=\'#= item.FrontAwesomeClass #\' id=\'#=item.id#\'></i><span class = "general-font">#=  item.text #</span>'
      dragAndDrop: true
      animation: true
      loadOnDemand: false
      select: onSelect
    ).data('kendoTreeView')

    # MenuNode = menu
    $(MenuNode).kendoContextMenu
      target: treeViewNode
      filter: '.k-in'
      select: treeSelect

# initMonConfigMapData
initMonConfigMapData = ->
  monConfigInfoFieldArray = new Array(3)
  for index in monConfigInfoFieldArray
    monConfigInfoFieldArray[index] = new SysUserApiStruct.CShfeFtdcReqQryMonConfigInfoField()
  monConfigInfoField[0].ConfigName = "ObjectIDNS";  
  monConfigInfoField[1].ConfigName = "DomainNS";
  monConfigInfoField[2].ConfigName = "AttrName";

  monConfigRspData = [];
  monConfigRspData["ObjectIDNS"] = "";
  monConfigRspData["DomainNS"] = "";
  monConfigRspData["AttrName"] = "";

  isReqMonConfigEnd = [];
  isReqMonConfigEnd["ObjectIDNS"] = false;
  isReqMonConfigEnd["DomainNS"] = false;
  isReqMonConfigEnd["AttrName"] = false;

  monConfigInfoField = {}
  monConfigInfoField.RequestId = ++window.ReqQryMonConfigInfoRequestID;
  monConfigInfoField.rspMessage = EVENTS.RspQryMonConfigInfo + monConfigInfoField.RequestId;
  monConfigInfoField.reqMessage = EVENTS.ReqQryMonConfigInfo

  userApi.emitter.on monConfigInfoField.rspMessage, (data) ->
    pRspQryMonConfigInfo = data.pRspQryMonConfigInfo
    bIsLast = data.bIsLast
    if pRspQryMonConfigInfo instanceof Object 
      if undefined !== monConfigRspData[pRspQryMonConfigInfo.ConfigName] 
        monConfigRspData[pRspQryMonConfigInfo.ConfigName] += pRspQryMonConfigInfo.ConfigContent
        isReqMonConfigEnd[pRspQryMonConfigInfo.ConfigName] = bIsLast;
        isAllRspEnd = true;

        for ConfigName in isReqMonConfigEnd
          if !isReqMonConfigEnd[ConfigName]
            isAllRspEnd = false;
            break;

        if isAllRspEnd
          for ConfigName in isReqMonConfigEnd 
            g_treeViewMapData[ConfigName] = processMonConfigInfoData(monConfigRspData[ConfigName])            
          userApi.emitter.emit "AllMonConfigDataReceived",{}    

  userApi.emitter.on EVENTS.RspQyrUserLoginSucceed, (data) =>
    console.log EVENTS.RspQyrUserLoginSucceed
    for index in monConfigInfoFieldArray
      monConfigInfoField.reqObject = monConfigInfoFieldArray[index]
      userApi.emitter.emit monConfigInfoField.reqMessage, monConfigInfoField

processMonConfigInfoData = (originData) ->
	 tmpData = originData.split("\n");
   numberStringIndex = getTransDataIndex(tmpData);	
	 transData = [];

	for i in tmpData
		tmpData[i] = tmpData[i].split(",");
		if tmpData[i].length === 2
			transData[tmpData[i][numberStringIndex.numberIndex]] = tmpData[i][numberStringIndex.stringIndex].replace(' ','');
			# console.log (tmpData[i][numberStringIndex.numberIndex] + ': ' + transData[tmpData[i][numberStringIndex.numberIndex]]);			
	return transData;


getTransDataIndex = (originData) ->
	indexData = {};
	for i in originData
		 testData = originData[i].split(",");
		if (testData.length === 2) 
			if isNumber(testData[0]) 
				indexData.numberIndex = 0;
				indexData.stringIndex = 1;
      else 
				indexData.numberIndex = 1;
				indexData.stringIndex = 0;
			break;
	return indexData;

isNumber = (value) ->
	 valueArray = value.split('');
	 numbArray = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9'];
	 isNumb = false;
	for i in valueArray
		isNumb = false; 
		for j in numbArray
			if valueArray[i].toString() == numbArray[j].toString()
				isNumb = true;
				break;
		if !isNumb 
      return isNumb
	return isNumb


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

arrayConverseToJson = (data) ->
  finalRst = []
  dataLenth = data.length
  i = 0
  while i < data.length
    process data[i], finalRst
    i++
  finalRst

process = (data, finalRst) ->
  idArray = data.ObjectID.split('.')
  tracePath = []
  idx = 0
  searchResult = searchNode(idArray, idx, finalRst, tracePath)
  distance = Math.abs(idArray.length - (tracePath.length))
  itemsArray = finalRst
  if searchResult == false
    i = 0
    while i < tracePath.length
      itemsArray = itemsArray[tracePath[i]].items
      i++
    itemsArray.push
      'text': if distance > 1 then 'exception!' else data.ObjectName
      'curID': idArray[tracePath.length]
      'id': if distance > 1 then 'exception!' else data.ObjectID
      'FrontAwesomeClass': WarningType(data.WarningActive)
      'items': if idArray[idArray.length - 2] == 'os' then osLeafNodeData else []
    if distance > 1
      process data, finalRst
  else
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
      searchResult = searchNode(idArray, ++idx, rst[i].items, tracePath)
      return searchResult
    i++
  false


treeSelect = (e) ->
  # event data
  # e.item : the selected item
  # e.type : type is "select"
  # e.target : the current target of the contentmenu - the current element
  #  dataItem = g_treeView.dataItem(e.target);#dataItem 获取该节点信息，返回的数据格式为kendo.data.Node
  # console.log(g_treeView.dataItem(e.target))
  if typeof e != 'object'
    return
  switch e.item.id
    when 'rename'
      console.log 'rename'
      renameNode e.target
    when 'delete'
      g_treeView.remove e.target
    when 'cancelMessage'
      # console.log e
      # console.log e.target
      $(e.target).find('i').addClass('warning')
      $(e.target).parents().find('i').addClass('warning')
    when 'activeMessage'
      $(e.target).find('i').parents().find('i').removeClass('warning')
      console.log 'active rspMessage'
  return

renameNode = (nodeJquery) ->
  # 通过atom的 Panel 改变节点的text值
  para = document.createElement('input')
  # Create a <input> element
  para.classList.add 'native-key-bindings'
  node = g_treeView.dataItem(nodeJquery)
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



onSelect = (e) ->
  # console.log(e)
  dataItem = g_treeView.dataItem(e.node)
  # console.log dataItem.id
  reqQryOidRelationData = new userApiStruct.CShfeFtdcReqQryOidRelationField()
  reqQryOidRelationData.ObjectID = dataItem.id
  reqQryOidRelationField = {}
  reqQryOidRelationField.reqObject  = reqQryOidRelationData
  reqQryOidRelationField.RequestId  = ++window.ReqQryOidRelationTopicRequestID
  reqQryOidRelationField.rspMessage = EVENTS.RspQryOidRelationTopic + reqQryOidRelationField.RequestId
  window.reqQryOidRelationField = reqQryOidRelationField;
  window.isPageID = true;
  rspData = []
  userApi.emitter.emit EVENTS.ReqQryOidRelationTopic, reqQryOidRelationField

  userApi.emitter.on reqQryOidRelationField.rspMessage, (data)->
    # console.log reqQryOidRelationField.rspMessage
    # console.log data
    if data.hasOwnProperty 'pRspQryOidRelation'
      rspData.push data.pRspQryOidRelation
      if data.bIsLast == true
        gridID = getObjectID(data.pRspQryOidRelation.ObjectID)
        gridDataEventName = gridID
        # console.log "gridDataEventName: "+ gridDataEventName

        userApi.emitter.emit gridDataEventName, {'rspData':rspData, 'gridID':gridID}

        rspData = []

  if 'items' of dataItem == false or dataItem.items.length == 0
    uri = 'atom:#gridViewDemo' + dataItem.id
    atom.workspace.open uri

  return

module.exports.setTreeViewData = setTreeViewData
