# treeview 显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$
{buildTreeView} = require './treeViewDataProcess.js'

module.exports =
class TreeView extends ScrollView
  @content: ->
    @div class:'MonitorObjectListPanel',=>
      @div class: 'tree-view-resizer pane-item native-key-bindings', outlet:'TreeviewPanel', =>
        @div id:'BeforeTreeview',  outlet:'BeforeTreeview',=>
          @h2  '监控对象列表', id:'title',class : 'general-font'
          @div class:"filterText", =>
            @div class: 'block',=>
              @button  class: 'btn general-font', id:'collapseAllNodes', '折叠所有节点'
              @button  class: 'btn general-font', id: 'addUpdate', '增 量 更 新'
            @label style:'font-weight:bold', for:'search-term', 'Search : '
            @input type:'text', id:'search-term', placeholder:'  I am looking for...'
        @div id: 'MonitorObjectListPanel-Treeview', class: 'TreeviewClass tree-view-scroller', outlet:'TreeviewList'
        @div class: 'tree-view-resize-handle'
        @ul id:'menu', outlet: 'menu',=>
          @li id:'rename',=>
            @i class: 'fa fa-coffee', 'Rename'
          @li id:'delete', =>
            @i class: 'fa fa-times', 'Delete'
          @li id:'activeMessage', =>
            @i class: 'fa fa-times', '激活告警通知'
          @li id:'cancelMessage', =>
            @i class: 'fa fa-times', '取消告警通知'
  attached: ->
    
    buildTreeView(@TreeviewList, @menu)
    
    @setTreeviewHeight()

  setTreeviewHeight: ->
    $('.MonitorObjectListPanel').css 'min-width','200px' # 设置treeview窗口的最小宽度
    divHeight = 90
    windowHeight = window.innerHeight
    actHeight = windowHeight - divHeight - 40
    @TreeviewList.height actHeight
    # 设置treeview窗口的高度
    $(window).resize =>
      # 根据窗口大小自动调整treeview窗口高度
      #process here
      windowHeight = window.innerHeight
      divHeight = $(@BeforeTreeview).height()
      resizeHeight = windowHeight - divHeight - 40
      @TreeviewList.height resizeHeight # 设置treeview窗口的高度

  detached: ->

  initialize: () ->

    @handleEvents()

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
