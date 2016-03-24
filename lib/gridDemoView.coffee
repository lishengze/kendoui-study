_ = require 'underscore-plus'
{Disposable} = require 'atom'
{ScrollView} = require 'atom-space-pen-views'
$=require('atom-space-pen-views').$

module.exports =
class Demo extends ScrollView
  @content: ->
    @div class: 'baobiaoContainer pane-item native-key-bindings timecop', tabindex: -1, =>
        @div id: 'gridOne'
        @div id: 'rizhi'
        @div id: 'CPUUsageModel', =>
          @div id: 'toolbar', class: 'k-grid-toolbar'
          @div id: 'CPUUsage', class: 'highstockChart'
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
    # alert('$ is:'+$('#d3Div').attr('class'));

  serialize: ->
    deserializer: @constructor.name
    uri: @getURI()

  getURI: -> @uri

  getTitle: (state)-> '事件'
