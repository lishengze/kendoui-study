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

function testFunc () {
    var ObjectIDArrray = ["A", "A.a", "B", "B.b"];
	var ObjectNameArray = ["A", "a", "B", "b"];
    var originData = [];
    for (var i = 0; i < ObjectIDArrray.length; ++i) {
        originData.push({'ObjectID': ObjectIDArrray[i], 'ObjectName': ObjectNameArray[i], 'WarningActive': 0});
    }
    console.log ('OriginData: ');
    console.log (originData);

    var transData = arrayConverseToJson(originData);
    console.log ('TransData: ');
    console.log (transData);
}

testFunc();