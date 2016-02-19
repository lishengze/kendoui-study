{View} = require 'space-pen'
{CompositeDisposable} = require 'atom'

module.exports =
class SidebarIconView extends View
  @content: ->
    @div class: 'sidebarIcon monitor-treeview', =>
      @a outlet: 'anchor', =>
        @span class: 'fa fa-list fa-3x', click: 'handleClick'

  initialize: (@panel) ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.tooltips.add(@anchor[0], {title: '树形列表'})

  handleClick: (event, element) ->
    @main ?= require './main'
    @main.sidebar.togglePanel @panel

  destroy: ->
    @subscriptions?.dispose()
    @main = null
    @panel?.destroy()
    @remove()
