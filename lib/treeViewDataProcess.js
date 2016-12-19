/*
* @fileoverview:
*   设置TreeView的数据源，并注册打开gridView对应Panel的接口。
*   文件输出的api是buildTreeView,其余的函数都附属于这个函数。
* author:
*    创建: 李献魁
*    修改: 李晟泽  2016.12.07;
*/

/*
* 函数: buildTreeView
* 功能: 设置treeView的组件内容;
* 实现: 1. initGlobalPara(): 初始化全局变量;
*      2. setTreeViewBasicPro(): 设置TreeView的基础属性;
*      3. initMonConfigMapData(): 请求treeView数据节点ID与其对应数字的映射表。
*      4. reqTreeViewData(): 请求treeView数据并将其转化成treeView插件需要的形式，设置treeView数据源，完成treeView的构建。
*      5. eventsHandler(): 交互的事件处理函数。
* @param {outlet} treeViewNode，指向页面上的TreeView元素段落节点，设置TreeView的句柄。
* @param {outlet} MenuNode, 指向页面上的menu元素标签，设置menu的句柄。
* @return {null}。
*/
function buildTreeView (treeViewNode, MenuNode) {
  
  initGlobalPara();

  setTreeViewBasicPro(treeViewNode, MenuNode);

  initMonConfigMapData();

  reqTreeViewData();

  eventsHandler();
};

/*
* 函数: initGlobalPara
* 功能: 初始化全局变量;
* g_treeViewMapData 存储treeview, grid 属性指标数字字符串映射表, 将其挂载到window对象上。
* g_treeView: TreeView的引用对象，为了方便其他函数使用，将其设置为当前页面全局对象。
*/
function initGlobalPara () {
  g_treeView = null;
  window.g_treeViewMapData = [];
  g_treeViewMapData["ObjectIDNS"] = [];
  g_treeViewMapData["DomainNS"] = [];
  g_treeViewMapData["AttrName"] = [];
}

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
        if (bIsLast) {
          // console.log (pRspQryMonConfigInfo.ConfigName);
        }
        var isAllRspEnd = true;        
        for (var ConfigName in isReqMonConfigEnd) {
          if (!isReqMonConfigEnd[ConfigName]) {
            isAllRspEnd = false;
            break;
          }
        }
        if (isAllRspEnd) {
          // console.log ('MonConfigData is all end!');
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

function reqTreeViewData () {
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
			treeviewData = transToTreeViewData(orginalTreeViewData);
      g_treeView.setDataSource(new kendo.data.HierarchicalDataSource({data: treeviewData}));
    }
  });
}

function eventsHandler () {
  var addUpdate, insertNode,  removeNode,  updateNode;
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

  addUpdate = function (jsonData) {
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

  $('#collapseAllNodes').click(function() {
    g_treeView.collapse('.k-item');
  });

}

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
}

function testMonConfigDataFunc (ConfigName, monConfigRspData) {
  var fs = require ('fs');
  var path = require ('path');
  var outputData = "------------------ "+ ConfigName + " Data START!-----------------\n"
                  + monConfigRspData[ConfigName] 
                  + "------------------ "+ ConfigName + " Data END!-----------------\n\n";
  var jsFileName = path.join (__dirname, './rspResult.txt');  
  fs.appendFileSync(jsFileName, outputData);
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

/*
* 函数: transToTreeViewData
* 功能: 将原始的回调数据转换成TreeView插件要求的格式;
* 实现: 1. 将高度一样的节点存储到同一个数组中，再将这些数组组合成一个二维数组。
					 高度低的为父节点，高的是子节点，安照高度从低到高存储节点数组。
			 2. 从父节点数组递归的向高度高一层的子节点数组寻找对应的子节点，同时构建TreeView的json数据。
* @param {array} originData: 原始的回调数据组成的数组，每个数组都是一个pRspQryMonitor2Object对象。       
*/
function transToTreeViewData (originData) {
	var sortedData = sortTreeViewData (originData);
	var treeData = buildTreeNode (sortedData);
	return treeData;
} 

/*
* 函数：sortTreeViewData
* 功能: 将原始的回调数据转换成补全后的依照高度排序的二维节点数组。
* 实现: 1. 先将原始数据以节点高度为下标存储到一个临时的空二维数组中。
			 2. 将临时数组中的数据按序提取到一个新的二维数组中。
			 3. 除了根节点，每一个子节点都要有高度只比他高一层的父节点。
			    所以遍历排序后的二维节点数组，补全缺失的父节点。
* @param {array} originData: 原始的回调数据组成的数组，每个数组都是一个pRspQryMonitor2Object对象。          
*/
function sortTreeViewData (originData) {
	var predictTreeNodeLength = 50
	var tmpData = new Array(predictTreeNodeLength);
	var sortedData = [];
	for (var i = 0; i < tmpData.length; ++i) {
		tmpData[i] = [];
	}

	for (i = 0; i < originData.length; ++i) {
		var len = originData[i].ObjectID.split('.').length;
		tmpData[len].push(originData[i]);
	}

	for (var i = 0; i < tmpData.length; ++i) {
		if (tmpData[i].length > 0) {
			sortedData.push(tmpData[i]);
		}
	}

  sortedData = completeTreeData(sortedData);
  for (i = 0; i < sortedData.length; ++i) {
		sortedData[i] = quickSort(sortedData[i], minCompTreeData);
	}
	return sortedData;
}

function minCompTreeData (obj1, obj2) {
	return obj1.ObjectID.toLowerCase() < obj2.ObjectID.toLowerCase();
}

function quickSort (arr, minCompFunc) {
	if (arr.length <= 1) { return arr; }
	var pivotIndex = Math.floor(arr.length / 2);
	var pivot = arr.splice(pivotIndex, 1)[0];
	var left = [];
	var right = [];
	for (var i = 0; i < arr.length; i++){
			if (minCompFunc(arr[i], pivot)) {
				left.push(arr[i]);
			} else {
				right.push(arr[i]);
			}
	}
	return quickSort(left, minCompFunc).concat([pivot], quickSort(right, minCompFunc));
}

function completeTreeData (sortedData) {
	for (var i = sortedData.length - 1; i > 0; --i) {
		for (var j = 0; j < sortedData[i].length; ++j) {
			var curFatherObjID = getFatherObjectID (sortedData[i][j].ObjectID);
			if (!isInFahterNodeArray(curFatherObjID, sortedData[i-1])) {
				// console.log ('missedFatherObjectID: ' + curFatherObjID);
				sortedData[i-1].push({
					'ObjectID': curFatherObjID,
					'ObjectName': curFatherObjID.split('.').pop(),
					'WarningActive': 0
				});
			}
		}		
	}

	return sortedData;
}

function isInFahterNodeArray (objectID, dataArray) {
	for (var i = 0; i < dataArray.length; ++i) {
		if (objectID === dataArray[i].ObjectID) return true;
	}
	return false;
}

function getFatherObjectID (childObjectID) {
	var childObjectIDArray = childObjectID.split('.');
	childObjectIDArray.pop();
	return childObjectIDArray.join('.');
}

function buildTreeNode (sortedData) {
	var treeData = getChildNode(null, sortedData, 0);
	return treeData;
}

function printData (valueName, value) {
	if (null === value) return;
	if (typeof value === "object") {
		for (var val in value) {
			printData(val, value[val]);
		}
	} else {
		console.log (valueName + " : " + value);
	}
}

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

/*
* 函数: getChildNode
* 功能: 获得当前父节点在curTreeNodeHeight层以及以下的所有子节点组成的对应树形json数据。
* 实现: 1. 若已经超过树的高度，说明已经结束，返回空。
			 2. 遍历当前层的所有节点为当前父节点寻找子节点，
			    若是子节点则以这个子节点为父节点递归的寻找更低高度的子节点，并获得对应的树形json。
			 3. 将当前高度层所有的树形子节点结构存储到一个数组中并返回。
* @param {CShfeFtdcRspQryMonitor2ObjectField} curFatherNode:当前父节点节点对象
* @param {Array} treeNodeArray: 完整的树节点的二维数组
* @param {number} curTreeNodeHeight: 当前树的高度
* @return {json} treeData: 当前父节点在curTreeNodeHeight层以及以下的所有子节点组成的对应树形json数据。       
*/
function getChildNode (curFatherNode, treeNodeArray, curTreeNodeHeight) {
	if (curTreeNodeHeight >= treeNodeArray.length) return null;
	var treeData = [];
	for (var i = 0; i < treeNodeArray[curTreeNodeHeight].length; ++i) {
		if (curTreeNodeHeight === 0 || isSubString(curFatherNode.ObjectID, treeNodeArray[curTreeNodeHeight][i].ObjectID)) {
			var curChildTreeData = {
				'id': treeNodeArray[curTreeNodeHeight][i].ObjectID,
				'text': treeNodeArray[curTreeNodeHeight][i].ObjectName,				
				'FrontAwesomeClass': getWarningType(treeNodeArray[curTreeNodeHeight][i].WarningActive),
				'items': getChildNode(treeNodeArray[curTreeNodeHeight][i], treeNodeArray, curTreeNodeHeight+1),
			};
			if (curChildTreeData.items && curChildTreeData.items.length === 0 
			    && isOSLeafNode(treeNodeArray[curTreeNodeHeight][i].ObjectID)) {
				curChildTreeData.items = osLeafNodeData;
			}
			treeData.push(curChildTreeData);
		}

	}
	return treeData;
}

function isOSLeafNode (treeNodeID) {
	var nodeArray = treeNodeID.split('.');
	for (var i = 0; i < nodeArray.length; ++i) {
		if (nodeArray[i] === "os") return true;
	}
	return false;
}

function getWarningType (value) {
  if (value === 0) {
    return 'fa fa-bell';
  } else if (value === 1) {
    return 'fa fa-bell-o';
  } else {
    return 'fa fa-bell-slash';
  }
}

function isSubString (fatherString, childString) {
	if (getFatherObjectID(childString) === fatherString) {
		return true;
	} else {
		return false;
	}
}

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

// function buildTreeView (treeViewNode, MenuNode) {
//   console.log ('buildTreeView');
// }

exports.buildTreeView = buildTreeView;
