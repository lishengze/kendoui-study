SidebarIconView = require './sidebarIconView'
{CompositeDisposable} = require 'atom'
TreeView = require './treeView.coffee'
{refreshChart} = require './refreshChart.js'
window.displayItem = []
# gridDemoUri = 'atom://gridDemo'
creatGridChartView = (state)->
  Demo = require './gridChartView.coffee'
  @p = new Demo(state)

window.getObjectID = (originalString) ->
  stringArray = originalString.split(".")
  transString = "",
  for value in stringArray
    transString += value
  return transString

module.exports =
  consumeSidebar: (@sidebar) ->
    @TreeView = new TreeView() #左侧 package内容栏
    @panel = atom.workspace.addLeftPanel(item: @TreeView, visible: false)
    @sidebarIconView = new SidebarIconView(@panel) # 带有图表的模块
    @sidebarTile = @sidebar.addTile(item: @sidebarIconView, priority: 1) # 将带有图表的模块放入左侧sidebar中

  activate: (state) ->
    @subscriptions = new CompositeDisposable
    refreshChart();
    window.index = 0
    window.registerRtnObjectAttrTopic   = false;
    window.IsRspQryOidRelationTopicDone = false;

    atom.workspace.onDidChangeActivePaneItem (item)->
      # console.log item
      if item == undefined
        return
      window.displayItem = [];
      window.displayItem[item.pageID] = true;

    atom.workspace.addOpener (filePath) ->
      originalPageId = filePath.substring(("atom://gridViewDemo").length)
      transPageId = getObjectID(originalPageId)
      # console.log originalPageId
      creatGridChartView({uri: filePath, gridID : transPageId, pageID: originalPageId})

  deactivate: ->
    @subscriptions?.dispose()
    @panel?.destroy()
    @sidebarIconView?.destroy()
    @sidebarTile?.destroy()

  serialize: ->
    # console.log 'serialize'
    monitorTreeviewViewState: @sidebarIconView.serialize()
