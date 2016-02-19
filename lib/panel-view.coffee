{$, $$, ScrollView} = require 'atom-space-pen-views'
module.exports =
class PanelView extends ScrollView
  @content: ->
    @span '树形展示'
