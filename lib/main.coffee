SidebarIconView = require './sidebarIcon-view'
{CompositeDisposable} = require 'atom'
PanelView = require './panel-view.coffee'

module.exports =
  consumeSidebar: (@sidebar) ->
    @panelView = new PanelView()
    @panel = atom.workspace.addLeftPanel(item: @panelView, visible: false)
    @sidebarIconView = new SidebarIconView(@panel)
    @sidebarTile = @sidebar.addTile(item: @sidebarIconView, priority: 1)


  activate: (state) ->
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

  deactivate: ->
    @subscriptions?.dispose()
    @panel?.destroy()
    @sidebarIconView?.destroy()
    @sidebarTile?.destroy()

  serialize: ->
    console.log 'serialize'
    monitorTreeviewViewState: @sidebarIconView.serialize()
