SidebarIconView = require './sidebarIcon-view'
{CompositeDisposable} = require 'atom'
PanelView = require './panel-view.coffee'
# gridDemoUri = 'atom://gridDemo'
creatGridDemo = (state)->
  Demo = require './gridDemoView.coffee'
  # console.log state.uri
  @p = new Demo(state)
  # @p.getTitle state.uri
  # @p
module.exports =
  consumeSidebar: (@sidebar) ->
    @panelView = new PanelView() #左侧 package内容栏
    @panel = atom.workspace.addLeftPanel(item: @panelView, visible: false)
    @sidebarIconView = new SidebarIconView(@panel)
    @sidebarTile = @sidebar.addTile(item: @sidebarIconView, priority: 1)


  activate: (state) ->
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable
    atom.workspace.addOpener (filePath) ->
      # console.log filePath
      creatGridDemo(uri: filePath)
    #   switch filePath
    #     when gridDemoUri then creatGridDemo(uri: gridDemoUri)
  deactivate: ->
    @subscriptions?.dispose()
    @panel?.destroy()
    @sidebarIconView?.destroy()
    @sidebarTile?.destroy()

  serialize: ->
    # console.log 'serialize'
    monitorTreeviewViewState: @sidebarIconView.serialize()
