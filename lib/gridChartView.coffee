# 节点信息显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

{setup} = require './gridChartDataProcess.js'
{nodePosition} = require './gridChartDataProcess.js'
{resizeNode} = require './gridChartDataProcess.js'

module.exports =
class Demo extends ScrollView
  @content : (params) ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
      @div outlet : 'leftContainer', class: 'leftContainer', =>
        @div class: 'block',=>
          @button  class: 'ASplitScreen SplitScreenBtn btn btn-lg general-font', outlet:'ASplitScreen' , '一分屏'
          @button  class: 'BinaryScreen SplitScreenBtn btn btn-lg general-font', outlet: 'BinaryScreen', '二分屏'
          @button  class: 'ThreeSplitScreen SplitScreenBtn btn btn-lg general-font', outlet:'ThreeSplitScreen', '三分屏'
          @button  class: 'FourSplitScreen SplitScreenBtn FourSplitScreenBtn btn btn-lg general-font', outlet: 'FourSplitScreen', '四分屏'
        @div  outlet:'gridData', =>
      @div outlet: 'chartData', =>
  attached: ->        
    console.log 'gridChartView attached!'
    setup(this)
    @windowResize()  # 全局的window resize 操作
    @eventProcess(this)
    @SplitScreen(this)
  eventProcess :(gridViewPointer) ->
     #事件操作， 每次对一个对象执行放大或者缩小时，
     #都应该设其 zindex值为所有对象中的最大值
     #由于不管是双击还是单击最大图标，都会调用click函数，所以，设置zindex的操作全部放在了click函数里

    $(gridViewPointer).delegate '.k-grid-toolbar', 'dblclick', ->
      #toolbar 双击操作
      gridViewPointer.MaxMinClickedTimes++
      node = $(this).parent()
      resizeNode gridViewPointer, node
      return
    $(gridViewPointer).click (e) ->
      #将鼠标点击的属性对象放置最上层
      $(e.target).parents('.AttrItem').css 'z-index', ++gridViewPointer.zIndex
      return
    $(gridViewPointer).delegate '.gridClose', 'click', ->
      #关闭
      node = $(this).parent().parent()
      $(node).hide()
      return
    $(gridViewPointer).delegate '.gridMax', 'click' ,->
      #放大缩小
      gridViewPointer.MaxMinClickedTimes++
      node = $(this).parent().parent()
      resizeNode gridViewPointer, node
      return
  windowResize: ->
    
    $(window).resize =>
      gridSelector = $('.gridOne')
    # 每次打开一个tab页，都会注册resize监听函数，当 window 大小重置时，所有页面都会执行resize操作
    # 当执行resize操作时，要重新计算属性列表的长宽。而测试发现，非当前页面的FourSplitScreen button position值为 0
    # 因此想到，执行非当前页面的属性列表长宽都 button 类 数组对象 中 position().left 最大的数据
      btnSelector = $('.FourSplitScreenBtn')[0]
      i = 1
      while i < $('.FourSplitScreenBtn').length
        if $(btnSelector).position().left < $($('.FourSplitScreenBtn')[i]).position().left
          btnSelector = $('.FourSplitScreenBtn')[i]
        i++
      this.MaxMinClickedTimes = 0 ##若resize则将计数器设为 0
      console.log $(btnSelector).position()
      if $(btnSelector).position() != undefined
        $(gridSelector).outerWidth $(btnSelector).position().left + $(btnSelector).outerWidth()
        $(gridSelector).height window.innerHeight - ($(btnSelector).offset().top) - $(btnSelector).outerHeight() - 20
        this.containerHeight = window.innerHeight - 50
        this.containerLeft = $(btnSelector).position().left + $(btnSelector).outerWidth() + 5;
        this.screenWidth = $('.baobiaoContainer').width() - this.containerLeft - 20
      # console.log this.gridID
      # console.log this.screenSelect
      nodePosition(this, true)
  SplitScreen:(gridViewPointer) ->
    $(gridViewPointer.ASplitScreen).click (e) ->
      console.log gridViewPointer.gridID
      gridViewPointer.screenSelect = 1
      nodePosition gridViewPointer, false
      return
    $(gridViewPointer.BinaryScreen).click (e) ->
      console.log gridViewPointer.gridID
      gridViewPointer.screenSelect = 2
      nodePosition gridViewPointer, false
      return
    $(gridViewPointer.ThreeSplitScreen).click (e) ->
      gridViewPointer.screenSelect = 3
      nodePosition gridViewPointer, false
      return
    $(gridViewPointer.FourSplitScreen).click (e) ->
      console.log gridViewPointer.gridID
      gridViewPointer.screenSelect = 4
      nodePosition gridViewPointer, false
      return
  detached: ->

  initialize: ({@uri,@gridID,@pageID}) ->

  serialize: ->
    deserializer: @constructor.name
    uri: @getURI()

  getURI: -> @uri

  getTitle: ->
    @uri.substring(gridChartTitileHead.length)
