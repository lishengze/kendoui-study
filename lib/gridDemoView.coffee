# 节点信息显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

module.exports =
class Demo extends ScrollView
  @content : (params) ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
      @div id : 'leftContainer'+ params.gridID, class: 'leftContainer', =>
        @div class: 'block',=>
          @button  class: 'SplitScreenBtn btn btn-lg', id:'ASplitScreen' + params.gridID, '一分屏'
          @button  class: 'SplitScreenBtn btn btn-lg', id: 'BinaryScreen'+ params.gridID, '二分屏'
          @button  class: 'SplitScreenBtn btn btn-lg', id:'ThreeSplitScreen'+ params.gridID, '三分屏'
          @button  class: 'SplitScreenBtn btn btn-lg', id: 'FourSplitScreen'+ params.gridID, '四分屏'
        @div id : 'gridData'+ params.gridID, outlet:'gridData', =>
      @div id : 'chartData'+ params.gridID, outlet: 'chartData', =>
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
    {beginReceiveData}=require './gridDemo.js'
    setup(this)
    # beginReceiveData(@index)

  detached: ->
    {stopReceiveData}=require './gridDemo.js'
    stopReceiveData()

  initialize: ({@uri,@gridID,@pageID}) ->
    console.log @uri
    # view = new Demo
    # view.find('div').append('<div class = "leftContainer"></div>')
    # @addClass('leftContainer')
    # alert 'haha'
    # alert('summary is:'+@summary);
    # alert('summary class is:'+@summary.attr('class'));
    # alert('$ is:'+$('#d3Div').attr('cl
  serialize: ->
    deserializer: @constructor.name
    uri: @getURI()

  getURI: -> @uri

  getTitle: ->
    @uri.substring(19)
