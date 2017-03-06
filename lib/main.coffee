SidebarIconView = require './sidebarIconView'
{CompositeDisposable} = require 'atom'
TreeView = require './treeView.coffee'
{refreshChart} = require './refreshChart.js'
window.displayItem = []

creatGridChartView = (state)->
  Demo = require './gridChartView.coffee'  
  @p = new Demo(state)
  # console.log 'creatGridChartView!'

window.getObjectID = (originalString) ->
  stringArray = originalString.split(".")
  transString = ""
  for value in stringArray
    transString += value
  return transString



module.exports =
  consumeSidebar: (@sidebar) ->
    @TreeView = new TreeView() 
    @panel = atom.workspace.addLeftPanel(item: @TreeView, visible: false)
    @sidebarIconView = new SidebarIconView(@panel) 
    @sidebarTile = @sidebar.addTile(item: @sidebarIconView, priority: 1) # 将带有图表的模块放入左侧sidebar中

  activate: (state) ->
    # console.log 'TreeView Activate!'
    @subscriptions = new CompositeDisposable
    refreshChart();
    window.index = 0
    window.registerRtnObjectAttrTopic   = false;
    window.IsRspQryOidRelationTopicDone = false;
    window.gridChartTitileHead = "atom://gridViewDemo"
    atom.workspace.onDidChangeActivePaneItem (item)->
      if item == undefined
        return
      window.displayItem = [];
      window.displayItem[item.pageID] = true;

    atom.workspace.addOpener (filePath) ->
      
      # console.log filePath
      if filePath.substring(0, gridChartTitileHead.length) == gridChartTitileHead
        # console.log 'Add Opener: ' + filePath 
        originalPageId = filePath.substring(gridChartTitileHead.length)
        transPageId = getObjectID(originalPageId)
        creatGridChartView({uri: filePath, gridID : transPageId, pageID: originalPageId})

  deactivate: ->
    @subscriptions?.dispose()
    @panel?.destroy()
    @sidebarIconView?.destroy()
    @sidebarTile?.destroy()

  serialize: ->
    monitorTreeviewViewState: @sidebarIconView.serialize()
