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
      searchResult = searchNode(idArray, ++idx, rst[i].items, tracePath)
      return searchResult
    i++
  false

testArrayConverse = ->
		ObjectIDArrray = ["A", "A.a", "B", "B.b"]
		ObjectNameArray = ["A", "a", "B", "b"]	

