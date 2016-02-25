_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$
module.exports =
class PanelView extends ScrollView
  @content: ->
    @div id: 'MonitorObjectListPanel' , class: ' MonitorObjectListPanel tree-view-resizer pane-item native-key-bindings',tabindex: -1, =>
      @div id:'BeforeTreeview', =>
        @h2  '监控对象列表', id:'title'
        @div class:"filterText", id: ''
      @div id: 'MonitorObjectListPanel-Treeview', class: 'TreeviewClass tree-view-scroller'
      @div class: 'tree-view-resize-handle'

  attached: ->
    {setup}=require './setup.js'
    {beginReceiveData}=require './setup.js'
    setup()
    beginReceiveData()

  detached: ->
    {stopReceiveData}=require './setup.js'
    #stopReceiveData()
  initialize: (state) ->
    @handleEvents()
    # console.log state
    # @width(state.width) if state.width > 0
  handleEvents: ->
    @on 'mousedown', '.tree-view-resize-handle', (e) => @resizeStarted(e)
  resizeStarted: =>
    $(document).on('mousemove', @resizeTreeView)
    $(document).on('mouseup', @resizeStopped)

  resizeStopped: =>
    $(document).off('mousemove', @resizeTreeView)
    $(document).off('mouseup', @resizeStopped)

  resizeTreeView: ({pageX, which}) =>
    return @resizeStopped() unless which is 1

    # if atom.config.get('tree-view.showOnRightSide')
    #   width = @outerWidth() + @offset().left - pageX
    #   # console.log 'showOnRightSide'
    # else
    width = pageX - @offset().left
      # console.log 'showOnLeftSide'
    @width(width)
