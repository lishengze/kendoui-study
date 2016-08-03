# 节点信息显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

module.exports =
class Demo extends ScrollView
  @content : (params) ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
      @div class: 'block',=>
        @button  class: 'SplitScreenBtn btn btn-lg', id:'ASplitScreen', '一分屏'
        @button  class: 'SplitScreenBtn btn btn-lg', id: 'BinaryScreen', '二分屏'
        @button  class: 'SplitScreenBtn btn btn-lg', id:'ThreeSplitScreen', '三分屏'
        @button  class: 'SplitScreenBtn btn btn-lg', id: 'FourSplitScreen', '四分屏'
      @div id : 'leftContainer'+ params.index, class: 'leftContainer', =>
        @div id: 'gridOne'  + params.index, class: 'gridOne AttrItem'
      @div id: 'rizhi' + params.index, class: 'rizhi AttrItem'
      @div id: 'DisUsageModel' + params.index, class: 'UsageModel AttrItem', =>
        @div id: 'DisUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
        @div id: 'DisUsage' + params.index, class: 'highstockChart'
      @div id: 'CPUUsageModel' + params.index, class: 'UsageModel AttrItem', =>
        @div id: 'CPUUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
        @div id: 'CPUUsage' + params.index, class: 'highstockChart'
      @div id: 'TestUsageModel' + params.index, class: 'UsageModel AttrItem', =>
        @div id: 'TestUsageToolbar' + params.index, class: 'toolbar k-grid-toolbar'
        @div id: 'TestUsage' + params.index, class: 'highstockChart'
  attached: ->
    {setup}=require './gridDemo.js'
    {beginReceiveData}=require './gridDemo.js'
    setup(@index)
    beginReceiveData(@index)

  detached: ->
    {stopReceiveData}=require './gridDemo.js'
    stopReceiveData()

  initialize: ({@uri,@index}) ->
    console.log @index
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
