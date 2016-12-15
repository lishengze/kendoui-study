function getWarningType (value) {
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
  var finalResult = [];
  for (var i = 0; i < data.length; ++i) {
    process(data[i], finalResult);
  }
  return finalResult;
};

function process (data, finalResult) {
  var objectIDArray = data.ObjectID.split('.');
  var tracePath = [];
  var idIndex = 0;
  var searchResult = searchNode(objectIDArray, idIndex, finalResult, tracePath);

  console.log ('searchResult: ' + searchResult);
  console.log ('objectIDArray: '); console.log(objectIDArray);
  console.log ('idIndex: ' + idIndex);
  console.log ('finalResult: '); console.log (finalResult);
  console.log ('tracePath: '); console.log (tracePath); console.log ('\n');

  var distance = Math.abs(objectIDArray.length - tracePath.length);
  var itemsArray = finalResult;

  if (searchResult === false) {
    for (var i = 0; i< tracePath.length; ++i) {
      itemsArray = itemsArray[tracePath[i]].items;
    }
    itemsArray.push({
      'text': distance > 1 ? 'exception!' : data.ObjectName,
      'curID': objectIDArray[tracePath.length],
      'id': distance > 1 ? 'exception!' : data.ObjectID,
      'FrontAwesomeClass': getWarningType(data.WarningActive),
      'items': objectIDArray[objectIDArray.length - 2] === 'os' ? osLeafNodeData : []
    });
    if (distance > 1) {
      process(data, finalResult);
    }
  } else {
    i = 0;
    while (i < tracePath.length - 1) {
      itemsArray = itemsArray[tracePath[i]].items;
      i++;
    }
    itemsArray.push({
      'text': distance > 1 ? 'exception!' : data.ObjectName,
      curID: objectIDArray[tracePath.length],
      items: null
    });
    if (distance > 1) {
      process(data, finalResult);
    }
  }
};

// result 在当前result数组中查找
// idArray split之后的数组
// idx 当前在idArray中查找的位置
// tracePath 在整个finalRst中对应的路径
// searchNode，在result数值中查找由idArray和idx确定的finalRst的索引路径，结果输出到tracePath中。
function searchNode (objectIDArray, idIndex, result, tracePath) {
  if (idIndex === objectIDArray.length + 1) {
    return true;
  }
  for (var i = 0; i < result.length; ++i) {
    if (objectIDArray[idIndex] === result[i].curID) {
      tracePath.push(i);
      return searchNode(objectIDArray, ++idIndex, result[i].items, tracePath);
    }    
  }
  return false;
};

function testFunc () {
    var ObjectIDArrray = ["A.a", "A", "B", "B.b"];
	  var ObjectNameArray = ["a", "A", "B", "b"];
    var originData = [];
    for (var i = 0; i < ObjectIDArrray.length; ++i) {
        originData.push({'ObjectID': ObjectIDArrray[i], 'ObjectName': ObjectNameArray[i], 'WarningActive': 0});
    }
    // console.log ('OriginData: ');
    // console.log (originData);

    var transData = arrayConverseToJson(originData);
    console.log ('TransData: ');
    console.log (transData);
}

testFunc();