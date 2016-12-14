// @fileoverview:
//     设置TreeView的数据源，并注册打开gridView对应Panel的接口。
//     文件输出的api是setTreeViewData,其余的函数都附属于这个函数。
// @author:
//     创建: 李献魁
//     修改: 李晟泽  2016.12.07;

// var osLeafNodeData, 
   
// g_treeViewMapData 存储treeview, grid 属性指标数字字符串映射表, 将其挂载到window对象上。
// g_treeView: TreeView的引用对象，为了方便其他函数使用，将其设置为当前页面全局对象。
var g_treeView = null;
window.g_treeViewMapData = [];
g_treeViewMapData["ObjectIDNS"] = [];
g_treeViewMapData["DomainNS"] = [];
g_treeViewMapData["AttrName"] = [];

// setTreeViewData
// 功能: 设置treeView的组件内容;
// 实现: 先设置TreeView的组件属性，接着向后台请求数据;
//      然后对数据进行处理使其满足treeView插件的格式，最后将数据赋予treeView。
// @param {outlet} treeViewNode，指向页面上的TreeView元素段落节点，设置TreeView的句柄。
// @param {outlet} MenuNode, 指向页面上的menu元素标签，设置menu的句柄。
// @return {null}。
function setTreeViewData (treeViewNode, MenuNode) {
  var addUpdate, insertNode,  removeNode,  updateNode;

  setTreeViewBasicPro(treeViewNode, MenuNode);
  initMonConfigMapData();

  var monitor2ObjectInfo = new userApiStruct.CShfeFtdcReqQryMonitor2ObjectField();
  var monitor2ObjectField = {};
  monitor2ObjectField.reqObject = monitor2ObjectInfo;
  monitor2ObjectField.RequestId = ++window.ReqQryMonitor2ObjectTopicRequestID;
  monitor2ObjectField.rspMessage = EVENTS.RspQryMonitor2ObjectTopic + monitor2ObjectField.RequestId;
  monitor2ObjectField.reqMessage = EVENTS.ReqQryMonitor2ObjectTopic;

  userApi.emitter.on("AllMonConfigDataReceived", function(data) {
      console.log("AllMonConfigDataReceived");
      return userApi.emitter.emit(monitor2ObjectField.reqMessage, monitor2ObjectField);
  });

  var orginalTreeViewData = [];
  userApi.emitter.on(monitor2ObjectField.rspMessage, function(data) {
    var pRspQryMonitor2Object, treeviewData;
    pRspQryMonitor2Object = data.pRspQryMonitor2Object;
    pRspQryMonitor2Object.ObjectID = g_treeViewMapData["ObjectIDNS"][pRspQryMonitor2Object.ObjectID];
    testMonObjDataFunc(pRspQryMonitor2Object);
    orginalTreeViewData.push(pRspQryMonitor2Object);
    if (data.bIsLast === true) {
      treeviewData = arrayConverseToJson(orginalTreeViewData);
      sortData(treeviewData);
      g_treeView.setDataSource(new kendo.data.HierarchicalDataSource({data: treeviewData}));
    }
  });

  var arrayLeft = 0;
  var inputValue = '';
  var searchArray = [];

  $('#search-term').keyup(function(event) {
    var itemScrollTop, keyCode, parentNode, parentOffsetTop, term, tlen;
    keyCode = event.which;
    itemScrollTop = 0;
    term = this.value.toUpperCase();
    tlen = term.length;
    if (keyCode === 13 && $.trim($(this).val()) !== inputValue) {
      searchArray = [];
      inputValue = $.trim($(this).val());
      $('.k-in .highlight').each(function() {
        $(this).removeClass('highlight');
      });
      if ($.trim($(this).val()) === '') {
        return;
      }
      $('#MonitorObjectListPanel-Treeview span.k-in').each(function(index) {
        var classLength, html, i, p, q, text, warningClassName;
        text = $(this).text();
        warningClassName = '';
        if (this.firstChild.classList !== void 0) {
          classLength = this.firstChild.classList.length;
          i = 0;
          while (i < classLength) {
            if (this.firstChild.classList[i] === 'fa') {
              warningClassName = this.firstChild.classList[i] + ' ' + this.firstChild.classList[i + 1];
              break;
            }
            i++;
          }
        }
        html = '';
        q = 0;
        if ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
          html += '<span class = "' + warningClassName + '">' + text.substring(q, p) + '<span class = "highlight">' + text.substr(p, tlen) + '</span>' + '</span>';
          q = p + tlen;
        }
        if (q > 0) {
          html += text.substring(q);
          $(this).html(html);
          $(this).parentsUntil('.k-g_treeView', '.k-item').each(function(index, element) {
            g_treeView.expand($(this));
            $(this).data('search', term);
          });
        }
      });
      $('.highlight').each(function() {
        searchArray.push(this);
      });
      if (searchArray.length === 0) {
        return;
      }
      $('html, body, .k-g_treeView').animate({
        scrollTop: searchArray[0].offsetTop
      }, 0);
      g_treeView.select($(searchArray[0]));
      arrayLeft = searchArray.length - 1;
    } else if (keyCode === 13 && $.trim($(this).val()) === inputValue && searchArray.length > 1) {
      $('#MonitorObjectListPanel-Treeview .k-item').each(function(index) {
        if ($(this).data('search') === term) {
          $(this).parentsUntil('.k-g_treeView', '.k-item').each(function(index, element) {
            g_treeView.expand($(this));
          });
        }
      });
      itemScrollTop = searchArray[searchArray.length - arrayLeft].offsetTop;
      parentNode = searchArray[searchArray.length - arrayLeft].offsetParent;
      parentOffsetTop = parentNode.offsetTop;
      while (parentNode.offsetParent !== null) {
        itemScrollTop += parentOffsetTop;
        parentNode = parentNode.offsetParent;
        parentOffsetTop = parentNode.offsetTop;
      }
      g_treeView.select($(searchArray[searchArray.length - arrayLeft]));
      $('html, body, .k-g_treeView').animate({
        scrollTop: itemScrollTop - ($('.tree-view-resizer').height() * 0.25)
      }, 0);
      arrayLeft--;
      if (arrayLeft === 0) {
        arrayLeft = searchArray.length;
      }
    } else {

    }
  });

  $('#collapseAllNodes').click(function() {
    g_treeView.collapse('.k-item');
  });

  removeNode = function(text) {
    var foo, i;
    foo = g_treeView.findByText(text);
    if (foo.length !== 0) {
      i = 0;
      while (i < foo.length) {
        g_treeView.remove($(foo[i]));
        i++;
      }
    }
  };

  updateNode = function(data, text) {
    var foo, fooNode, i;
    foo = g_treeView.findByText(text);
    if (foo.length !== 0) {
      i = 0;
      while (i < foo.length) {
        fooNode = g_treeView.dataItem(foo[i]);
        console.log('updata here');
        fooNode.set('text', data.text);
        fooNode.set('FrontAwesomeClass', data.FrontAwesomeClass);
        i++;
      }
    } else {

    }
  };

  insertNode = function(data, text, bool) {
    var dataSource, foo, i;
    foo = g_treeView.findByText(text);
    if (foo.length !== 0) {
      i = 0;
      while (i < foo.length) {
        if (bool === true) {
          g_treeView.insertBefore(data, $(foo[i]));
        } else {
          g_treeView.insertAfter(data, $(foo[i]));
        }
        i++;
      }
    } else {
      dataSource = g_treeView.dataSource;
      dataSource.pushCreate(data);
    }
  };

  addUpdate = function(jsonData) {
    var addLength, deleteLength, i, updateLength;
    addLength = jsonData.add.length;
    if (addLength >= 0) {
      i = 0;
      while (i < addLength) {
        insertNode(jsonData.add[i].data, jsonData.add[i].text, jsonData.add[i].before);
        i++;
      }
    }
    deleteLength = jsonData["delete"].length;
    if (deleteLength >= 0) {
      i = 0;
      while (i < addLength) {
        removeNode(jsonData["delete"][i].text);
        i++;
      }
    }
    updateLength = jsonData.update.length;
    if (updateLength >= 0) {
      i = 0;
      while (i < addLength) {
        updateNode(jsonData.update[i].data, jsonData.update[i].text);
        i++;
      }
    }
  };

  $('#addUpdate').click(function() {
    var addData, addText, deleteText, jsonData, updateData, updateText;
    addData = [
      {
        text: 'addData',
        'FrontAwesomeClass': 'fa fa-bell',
        items: [
          {
            text: '处理器',
            'FrontAwesomeClass': 'fa fa-bell'
          }
        ]
      }
    ];
    addText = 'TMS_[实时监控系统]';
    deleteText = 'app';
    updateData = {
      text: 'update Text',
      'FrontAwesomeClass': 'fa fa-bell-slash',
      items: [
        {
          text: '处理器',
          'FrontAwesomeClass': 'fa fa-bell'
        }
      ]
    };
    updateText = 'exception!';
    jsonData = {
      'add': [
        {
          'data': addData,
          'text': addText,
          'before': true
        }
      ],
      'delete': [
        {
          'text': deleteText
        }
      ],
      'update': [
        {
          'data': updateData,
          'text': updateText
        }
      ]
    };
    addUpdate(jsonData);
  });
};

function setTreeViewBasicPro (treeViewNode, MenuNode) {
  g_treeView = $(treeViewNode).kendoTreeView({
    template: '<i class=\'#= item.FrontAwesomeClass #\' id=\'#=item.id#\'></i><span class = "general-font">#=  item.text #</span>',
    dragAndDrop: true,
    animation: false,
    loadOnDemand: false,
    select: onSelectGridData
  }).data('kendoTreeView');

  return $(MenuNode).kendoContextMenu({
    target: treeViewNode,
    filter: '.k-in',
    select: treeSelect
  });
};

function initMonConfigMapData () {
  var monConfigInfoFieldArray = new Array(3);
  for (var index = 0; index < monConfigInfoFieldArray.length; ++index) {
    value = monConfigInfoFieldArray[index];
    monConfigInfoFieldArray[index] = new userApiStruct.CShfeFtdcReqQryMonConfigInfoField();
  }
  monConfigInfoFieldArray[0].ConfigName = "ObjectIDNS";
  monConfigInfoFieldArray[1].ConfigName = "DomainNS";
  monConfigInfoFieldArray[2].ConfigName = "AttrName";

  var monConfigRspData = [];
  monConfigRspData["ObjectIDNS"] = "";
  monConfigRspData["DomainNS"] = "";
  monConfigRspData["AttrName"] = "";

  var isReqMonConfigEnd = [];
  isReqMonConfigEnd["ObjectIDNS"] = false;
  isReqMonConfigEnd["DomainNS"] = false;
  isReqMonConfigEnd["AttrName"] = false;

  var monConfigInfoField = {};
  monConfigInfoField.RequestId = ++window.ReqQryMonConfigInfoRequestID;
  monConfigInfoField.rspMessage = EVENTS.RspQryMonConfigInfo + monConfigInfoField.RequestId;
  monConfigInfoField.reqMessage = EVENTS.ReqQryMonConfigInfo;

  userApi.emitter.on(monConfigInfoField.rspMessage, function(data) {
    var pRspQryMonConfigInfo = data.pRspQryMonConfigInfo;
    var bIsLast = data.bIsLast;
    if (pRspQryMonConfigInfo instanceof Object) {
      if (undefined !== monConfigRspData[pRspQryMonConfigInfo.ConfigName]) {
        monConfigRspData[pRspQryMonConfigInfo.ConfigName] += pRspQryMonConfigInfo.ConfigContent;
        isReqMonConfigEnd[pRspQryMonConfigInfo.ConfigName] = bIsLast;
        var isAllRspEnd = true;        
        for (var ConfigName in isReqMonConfigEnd) {
          if (!isReqMonConfigEnd[ConfigName]) {
            isAllRspEnd = false;
            break;
          }
        }
        if (isAllRspEnd) {
          for (var ConfigName in isReqMonConfigEnd) {
            testMonConfigDataFunc(ConfigName, monConfigRspData);
            g_treeViewMapData[ConfigName] = processMonConfigInfoData(monConfigRspData[ConfigName]);
          }
          return userApi.emitter.emit("AllMonConfigDataReceived", {});
        }
      }
    }
  });

  userApi.emitter.on(EVENTS.RspQyrUserLoginSucceed, function(data) {
    console.log(EVENTS.RspQyrUserLoginSucceed);
    for (index  = 0; index < monConfigInfoFieldArray.length; ++index) {
      monConfigInfoField.reqObject = monConfigInfoFieldArray[index];
      userApi.emitter.emit(monConfigInfoField.reqMessage, monConfigInfoField);
    }
  });
};

function testMonObjDataFunc (pRspQryMonitor2Object) {
  var fs = require ('fs');
  var path = require ('path');
  var outputData = "+++++++++++++++ Monitor2Object Data START!+++++++++++++++\n"
                  + "ObjectID :        " + pRspQryMonitor2Object.ObjectID.toString() + "\n"
                  + "ObjectName :      " + pRspQryMonitor2Object.ObjectName.toString() + "\n"
                  + "WarningActive :   " + pRspQryMonitor2Object.WarningActive.toString() + "\n"
                  + "+++++++++++++++ Monitor2Object Data END!+++++++++++++++\n\n";
  var jsFileName = path.join (__dirname, './rspResult.txt');  
  fs.appendFileSync(jsFileName, outputData);
  // fs.appendFile(jsFileName, outputData, function(err) {
  //   if (err) {
  //       console.log(err);
  //   } else {
  //     console.log ('Succeed in writing to ' + jsFileName);
  //   }
  // });
}

function testMonConfigDataFunc (ConfigName, monConfigRspData) {
  var fs = require ('fs');
  var path = require ('path');
  var outputData = "------------------ "+ ConfigName + " Data START!-----------------\n"
                  + monConfigRspData[ConfigName] 
                  + "------------------ "+ ConfigName + " Data END!-----------------\n\n";
  var jsFileName = path.join (__dirname, './rspResult.txt');  
  fs.appendFileSync(jsFileName, outputData);
  // fs.appendFile(jsFileName, outputData, function(err) {
  //   if (err) {
  //       console.log(err);
  //   } else {
  //     console.log ('Succeed in writing to ' + jsFileName);
  //   }
  // });
}

function processMonConfigInfoData (originData) {
  var tmpData = originData.split("\n");
  var numberStringIndex = getTransDataIndex(tmpData);
  var transData = [];
  for (var i = 0; i < tmpData.length; ++i) {
    var value = tmpData[i];
    tmpData[i] = tmpData[i].split(",");
    if (tmpData[i].length === 2) {
      transData[tmpData[i][numberStringIndex.numberIndex]] = tmpData[i][numberStringIndex.stringIndex].replace(' ', '');
    }
  }
  return transData;
};

function getTransDataIndex (originData) {
  var indexData = {};
  for (var i = 0; i < originData.length; ++i) {
    var testData = originData[i].split(",");
    if (testData.length === 2) {
      if (isNumber(testData[0])) {
        indexData.numberIndex = 0;
        indexData.stringIndex = 1;
      } else {
        indexData.numberIndex = 1;
        indexData.stringIndex = 0;
      }
      break;
    }
  }
  return indexData;
};

function isNumber (value) {
  var valueArray = value.split('');
  var numbArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var isNumb = false;
  for (var i = 0; i < valueArray.length; ++i) {
    if (valueArray[i] === ' ') {
      continue;
    }
    isNumb = false;
    for (var j = 0; j < numbArray.length; ++j) {
      if (valueArray[i].toString() === numbArray[j].toString()) {
        isNumb = true;
        break;
      }
    }
    if (!isNumb) {
      return isNumb;
    }
  }
  return isNumb;
};

function WarningType (value) {
  if (value === 0) {
    return 'fa fa-bell';
  } else if (value === 1) {
    return 'fa fa-bell-o';
  } else {
    return 'fa fa-bell-slash';
  }
};

var osLeafNodeData = [
  {
    'text': '处理器',
    items: null
  }, {
    'text': '磁盘IO',
    items: null
  }, {
    'text': '告警',
    items: null
  }, {
    'text': '关键文件',
    items: null
  }, {
    'text': '进程',
    items: null
  }, {
    'text': '路由信息',
    items: null
  }, {
    'text': '内存',
    items: null
  }, {
    'text': '日志',
    items: null
  }, {
    'text': '网络',
    items: null
  }, {
    'text': '文件系统',
    items: null
  }, {
    'text': '系统配置',
    items: null
  }, {
    'text': '系统状态',
    items: null
  }, {
    'text': '性能指标',
    items: null
  }, {
    'text': '用户',
    items: null
  }
];

function arrayConverseToJson (data) {
  var dataLenth, finalRst, i;
  finalRst = [];
  dataLenth = data.length;
  i = 0;
  while (i < data.length) {
    process(data[i], finalRst);
    i++;
  }
  return finalRst;
};

function process (data, finalRst) {
  var distance, i, idArray, idx, itemsArray, searchResult, tracePath;
  idArray = data.ObjectID.split('.');
  tracePath = [];
  idx = 0;
  searchResult = searchNode(idArray, idx, finalRst, tracePath);
  distance = Math.abs(idArray.length - tracePath.length);
  itemsArray = finalRst;
  if (searchResult === false) {
    i = 0;
    while (i < tracePath.length) {
      itemsArray = itemsArray[tracePath[i]].items;
      i++;
    }
    itemsArray.push({
      'text': distance > 1 ? 'exception!' : data.ObjectName,
      'curID': idArray[tracePath.length],
      'id': distance > 1 ? 'exception!' : data.ObjectID,
      'FrontAwesomeClass': WarningType(data.WarningActive),
      'items': idArray[idArray.length - 2] === 'os' ? osLeafNodeData : []
    });
    if (distance > 1) {
      process(data, finalRst);
    }
  } else {
    i = 0;
    while (i < tracePath.length - 1) {
      itemsArray = itemsArray[tracePath[i]].items;
      i++;
    }
    itemsArray.push({
      'text': distance > 1 ? 'exception!' : data.ObjectName,
      curID: idArray[tracePath.length],
      items: null
    });
    if (distance > 1) {
      process(data, finalRst);
    }
  }
};

function searchNode (idArray, idx, rst, tracePath) {
  var i, searchResult;
  if (idx === idArray.length + 1) {
    return true;
  }
  i = 0;
  while (i < rst.length) {
    if (idArray[idx] === rst[i].curID) {
      tracePath.push(i);
      searchResult = searchNode(idArray, ++idx, rst[i].items, tracePath);
      return searchResult;
    }
    i++;
  }
  return false;
};

function treeSelect (e) {
  if (typeof e !== 'object') {
    return;
  }
  switch (e.item.id) {
    case 'rename':
      console.log('rename');
      renameNode(e.target);
      break;
    case 'delete':
      g_treeView.remove(e.target);
      break;
    case 'cancelMessage':
      $(e.target).find('i').addClass('warning');
      $(e.target).parents().find('i').addClass('warning');
      break;
    case 'activeMessage':
      $(e.target).find('i').parents().find('i').removeClass('warning');
      console.log('active rspMessage');
  }
};

function renameNode (nodeJquery) {
  var newId, node, option, para;
  para = document.createElement('input');
  para.classList.add('native-key-bindings');
  node = g_treeView.dataItem(nodeJquery);
  newId = 'newName';
  para.id = newId;
  para.autofocus = true;
  para.type = 'text';
  console.log(para);
  option = {
    'item': para,
    'visible': true,
    'priority': 400
  };
  atom.workspace.addModalPanel(option);
  $('#' + newId).keyup(function(event) {
    var newName;
    if (event.keyCode === 13) {
      newName = $('#' + newId).val();
      node.set('text', newName);
      atom.workspace.addModalPanel({
        'item': para,
        'visible': false,
        'priority': 100
      });
      para.parentNode.removeChild(this);
    }
  });
};

function byName (name) {
  return function(o, p) {
    var a, b;
    a = void 0;
    b = void 0;
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name];
      b = p[name];
      if (a === b) {
        return 0;
      }
      if (typeof a === typeof b) {
        if (a < b) {
          return -1;
        } else {
          return 1;
        }
      }
      if (typeof a < typeof b) {
        return -1;
      } else {
        return 1;
      }
    } else {
      throw 'error';
    }
  };
};

function sortNew (data) {
  var i;
  if (data.items === null) {
    return;
  }
  i = 0;
  while (i < data.items.length) {
    data.items.sort(byName('text'));
    sortNew(data.items[i]);
    i++;
  }
};

function sortData (data) {
  var i;
  i = 0;
  while (i < data.length) {
    data.sort(byName('text'));
    sortNew(data[i]);
    i++;
  }
};

function onSelectGridData (e) {
  var dataItem, reqQryOidRelationData, reqQryOidRelationField, rspData, uri;
  dataItem = g_treeView.dataItem(e.node);
  reqQryOidRelationData = new userApiStruct.CShfeFtdcReqQryOidRelationField();
  reqQryOidRelationData.ObjectID = dataItem.id;
  reqQryOidRelationField = {};
  reqQryOidRelationField.reqObject = reqQryOidRelationData;
  reqQryOidRelationField.RequestId = ++window.ReqQryOidRelationTopicRequestID;
  reqQryOidRelationField.rspMessage = EVENTS.RspQryOidRelationTopic + reqQryOidRelationField.RequestId;
  window.reqQryOidRelationField = reqQryOidRelationField;
  window.isPageID = true;
  rspData = [];
  userApi.emitter.emit(EVENTS.ReqQryOidRelationTopic, reqQryOidRelationField);
  userApi.emitter.on(reqQryOidRelationField.rspMessage, function(data) {
    var gridDataEventName, gridID;
    if (data.hasOwnProperty('pRspQryOidRelation')) {
      rspData.push(data.pRspQryOidRelation);
      if (data.bIsLast === true) {
        gridID = getObjectID(data.pRspQryOidRelation.ObjectID);
        gridDataEventName = gridID;
        userApi.emitter.emit(gridDataEventName, {
          'rspData': rspData,
          'gridID': gridID
        });
        return rspData = [];
      }
    }
  });
  if ('items' in dataItem === false || dataItem.items.length === 0) {
    uri = 'atom:#gridViewDemo' + dataItem.id;
    atom.workspace.open(uri);
  }
};

// function setTreeViewData (treeViewNode, MenuNode) {
//   console.log ('setTreeViewData');
// }

exports.setTreeViewData = setTreeViewData;
