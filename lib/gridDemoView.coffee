# 节点信息显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

module.exports =
class Demo extends ScrollView
  @content : (params) ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
      @div outlet : 'leftContainer', class: 'leftContainer', =>
        @div class: 'block',=>
          @button  class: 'ASplitScreen SplitScreenBtn btn btn-lg', outlet:'ASplitScreen' , '一分屏'
          @button  class: 'BinaryScreen SplitScreenBtn btn btn-lg', outlet: 'BinaryScreen', '二分屏'
          @button  class: 'ThreeSplitScreen SplitScreenBtn btn btn-lg', outlet:'ThreeSplitScreen', '三分屏'
          @button  class: 'FourSplitScreen SplitScreenBtn FourSplitScreenBtn btn btn-lg', outlet: 'FourSplitScreen', '四分屏'
        @div  outlet:'gridData', =>
      @div outlet: 'chartData', =>
      #   @div id: 'gridOne'  + params.index, class: 'gridOne'
      # @div id: 'rizhi' + params.index, class: 'rizhi AttrItem'
      # @div id: 'DisUsageModel' + params.index, class: 'UsageModel AttrItem', =>
      #   @div id: 'DisUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
      #   @div id: 'DisUsage' + params.index, class: 'highstockChart'
      # @div id: 'CPUUsageModel' + params.index, class: 'UsageModel AttrItem', =>
      #   @div id: 'CPUUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
      #   @div id: 'CPUUsage' + params.index, class: 'highstockChart'
      # @div id: 'TestUsageModel' + params.index, class: 'UsageModel AttrItem', =>
      #   @div id: 'TestUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
      #   @div id: 'TestUsage' + params.index, class: 'highstockChart'
  attached: ->
    {setup}=require './gridDemo.js'
    setup(this)

    @windowResize()  # 全局的window resize 操作
    @eventProcess(this)
    # beginReceiveData(@index)
    # $('.k-grid-toolbar').dblclick ->
    #   #toolbar 双击操作
    #   console.log 'dblclick'
  eventProcess :(gridViewPointer) ->
    {resizeNode}=require './gridDemo.js'
    nodeCurPosition = []
    nodeWidth = 0
    nodeHeight = 0
    $('.baobiaoContainer').delegate '.k-grid-toolbar', 'dblclick', ->
      #toolbar 双击操作
      console.log gridViewPointer
      console.log this
      gridViewPointer.MaxMinClickedTimes++
      # console.log('dblclick')
      node = $(this).parent()
      console.log node
      resizeNode this, node, nodeCurPosition, nodeWidth, nodeHeight
      return
    document.onclick = (e) ->
      #将鼠标点击的属性对象放置最上层
      # $(e.target).parents('.AttrItem').css 'z-index', ++zIndex
      return
    $('.baobiaoContainer').delegate '.gridClose', 'click', ->
      #关闭
      console.log $(this).parent().parent()
      node = $(this).parent().parent()
      $(node).hide()
      return
    $('.baobiaoContainer').delegate '.gridMax', 'click' ,->
      #放大缩小
      gridViewPointer.MaxMinClickedTimes++
      node = $(this).parent().parent()
      resizeNode this, node, nodeCurPosition, nodeWidth, nodeHeight
      return
  windowResize: ->
    {nodePosition}=require './gridDemo.js'
    $(window).resize =>
      gridSelector = $('.gridOne')
      # console.log $('.FourSplitScreenBtn')
      # console.log @ASplitScreen
      # console.log @pageID
      # console.log $(@pageID)
    # 每次打开一个tab页，都会注册resize监听函数，当 window 大小重置时，所有页面都会执行resize操作
    # 当执行resize操作时，要重新计算属性列表的长宽。而测试发现，非当前页面的FourSplitScreen button position值为 0
    # 因此想到，执行非当前页面的属性列表长宽都 button 类 数组对象 中 position().left 最大的数据
      btnSelector = $('.FourSplitScreenBtn')[0]
      i = 1
      while i < $('.FourSplitScreenBtn').length
        if $(btnSelector).position().left < $($('.FourSplitScreenBtn')[i]).position().left
          btnSelector = $('.FourSplitScreenBtn')[i]
        i++
      $(gridSelector).outerWidth $(btnSelector).position().left + $(btnSelector).outerWidth()
      $(gridSelector).height window.innerHeight - ($(btnSelector).offset().top) - $(btnSelector).outerHeight() - 20
      this.containerHeight = window.innerHeight - 50
      this.containerLeft = $(btnSelector).position().left + $(btnSelector).outerWidth() + 5;
      this.screenWidth = $('.baobiaoContainer').width() - this.containerLeft - 20
      # console.log this.gridID
      # console.log this.screenSelect
      nodePosition(this)
  detached: ->
    # {stopReceiveData}=require './gridDemo.js'
    # stopReceiveData()

  initialize: ({@uri,@gridID,@pageID}) ->

  serialize: ->
    deserializer: @constructor.name
    uri: @getURI()

  getURI: -> @uri

  getTitle: ->
    @uri.substring(19)
