# 节点信息显示模块
_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

module.exports =
class Demo extends ScrollView
  @content: ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
      @div class : 'leftContainer', =>
        @div class: 'gridOne' + @uri.substr(20)
      @div class: 'rizhi'
      @div class: 'CPUUsageModel', =>
        @div class: 'toolbar k-grid-toolbar'
        @div class: 'CPUUsage highstockChart'
  attached: ->
    {setup}=require './gridDemo.js'
    {beginReceiveData}=require './gridDemo.js'
    setup()
    beginReceiveData()

  detached: ->
    {stopReceiveData}=require './gridDemo.js'
    stopReceiveData()

  initialize: ({@uri}) ->
    # alert 'haha'
    # alert('summary is:'+@summary);
    # alert('summary class is:'+@summary.attr('class'));
    # alert('$ is:'+$('#d3Div').attr('cl
  serialize: ->
    deserializer: @constructor.name
    uri: @getURI()

  getURI: -> @uri

  getTitle: ->
    @uri.substr(19)
