var fs = require("fs");
var transTreeViewFileName = "./transTreeViewData.txt";
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
* transToTreeViewData
* @param {array} originData: 原始的回调数据组成的数组，每个数组都是一个pRspQryMonitor2Object对象。
* 功能: 将原始的回调数据转换成TreeView插件要求的格式;
* 实现: 1. 将高度一样的节点存储到同一个数组中，再将这些数组组合成一个二维数组。
					 高度低的为父节点，高的是子节点，安照高度从低到高存储节点数组。
			 2. 从父节点数组递归的向高度高一层的子节点数组寻找对应的子节点，同时构建TreeView的json数据。
*/
function transToTreeViewData (originData) {
	var sortedData = sortTreeViewData (originData);
	var treeData = buildTreeNode (sortedData);
	return treeData;
} 

/*
* sortTreeViewData
* @param {array} originData: 原始的回调数据组成的数组，每个数组都是一个pRspQryMonitor2Object对象。
* 功能: 将原始的回调数据转换成补全后的依照高度排序的二维节点数组。
* 实现: 1. 先将原始数据以节点高度为下标存储到一个临时的空二维数组中。
			 2. 将临时数组中的数据按序提取到一个新的二维数组中。
			 3. 除了根节点，每一个子节点都要有高度只比他高一层的父节点。
			    所以遍历排序后的二维节点数组，补全缺失的父节点。
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
			// console.log ('TreeNodeLength: ' + i + ' , node number: ' + tmpData[i].length);
			// if (i === 2) {
			// 	for (var j = 0; j < tmpData[i].length; ++j) {
			// 		console.log ('ObjectID: ' + tmpData[i][j].ObjectID);
			// 	}
			// }
		}
	}
	sortedData = completeTreeData(sortedData);
	return sortedData;
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

	// console.log('CompleteTreeData: ');
	// for (i = 0; i < sortedData.length; ++i) {
	// 	console.log ('TreeNodeLength: ' + sortedData[i][0].ObjectID.split('.').length 
	// 	           + ' , node number: ' + sortedData[i].length);
	// }
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

/*
* getChildNode
* @param {CShfeFtdcRspQryMonitor2ObjectField} curFatherNode:当前父节点节点对象
* @param {[][]} treeNodeArray, 完整的树节点的二维数组
* @param {number} curTreeNodeHeight: 当前树的高度
* @return {json} treeData: 当前父节点在curTreeNodeHeight层以及以下的所有子节点组成的对应树形json数据。
* 功能: 获得当前父节点在curTreeNodeHeight层以及以下的所有子节点组成的对应树形json数据。
* 实现: 1. 若已经超过树的高度，说明已经结束，返回空。
			 2. 遍历当前层的所有节点为当前父节点寻找子节点，
			    若是子节点则以这个子节点为父节点递归的寻找更低高度的子节点，并获得对应的树形json。
			 3. 将当前高度层所有的树形子节点结构存储到一个数组中并返回。
*/
function getChildNode (curFatherNode, treeNodeArray, curTreeNodeHeight) {
	if (curTreeNodeHeight >= treeNodeArray.length) return null;
	var treeData = [];
	for (var i = 0; i < treeNodeArray[curTreeNodeHeight].length; ++i) {
		if (curTreeNodeHeight === 0 || isSubString(curFatherNode.ObjectID, treeNodeArray[curTreeNodeHeight][i].ObjectID)) {
			var curChildTreeData = {
				'id': treeNodeArray[curTreeNodeHeight][i].ObjectID,
				// 'text': treeNodeArray[curTreeNodeHeight][i].ObjectName,				
				// 'FrontAwesomeClass': getWarningType(treeNodeArray[curTreeNodeHeight][i].WarningActive),
				'items': getChildNode(treeNodeArray[curTreeNodeHeight][i], treeNodeArray, curTreeNodeHeight+1),
			};
			// if ("BM.TRADE.PuDian.os.mon-blade01" === treeNodeArray[curTreeNodeHeight][i].ObjectID) {
			// 	console.log (curFatherNode);
			// 	console.log (curChildTreeData);
			// 	console.log (curChildTreeData.items.length === 0);
			// 	console.log (isOSLeafNode(treeNodeArray[curTreeNodeHeight][i].ObjectID));
			// }
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
	// if (nodeArray[nodeArray.length - 2] === "os") return true;
	// return false;

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

function testIsOSLeafNode () {
	var str = "BM.TRADE.PuDian.os.mon-blade01";
	console.log (isOSLeafNode(str));
}

function testGetFatherObjectID () {
	var childObjectID = "BM.TRADE2.ZhangJ.os.mon-blade04";
	var fatherObjectID = getFatherObjectID(childObjectID);
	console.log ('childObjectID: ' + childObjectID);
	console.log ('fatherObjectID: ' + fatherObjectID);
}

function testIsSubString () {
	var str1 = "A.b";
	var str2 = "A.b.c";
	if (isSubString(str1, str2)) {
		console.log (str1 + ' is the father of ' + str2);
	} else {
		console.log (str1 + ' is not the father of ' + str2);
	}
}

function testTypeof () {
	var data = [1, "a", [1,2], {'a':1}, null]
	for (var i = 0; i < data.length; ++i) {
		console.log (typeof data[i]);
	}
}

function testSimuTreeViewData () {
    var ObjectIDArrray = ["B.b.c","A.a", 'A.b','A.b.c','A.b.d', "A", "B", "C", "B.b", "C.d"];
	  var ObjectNameArray = ["c","a", 'b', 'c', 'd', "A", "B", "C","b", "d"];
    var originData = [];
    for (var i = 0; i < ObjectIDArrray.length; ++i) {
        originData.push({'ObjectID': ObjectIDArrray[i], 'ObjectName': ObjectNameArray[i], 'WarningActive': 0});
    }
    // console.log ('OriginData: ');
    // console.log (originData);

    // var transData = arrayConverseToJson(originData);
		var transData = transToTreeViewData(originData);
		printData('transData: ' , transData);
}

function testRealTreeViewData () {
		var originData = require ("./treeViewData.json").rspData;
		var transData = transToTreeViewData(originData);

		// for (var i = 0; i < transData.length; ++i) {
		// 	console.log ('transData[' + i.toString() + '].items.length: ' + transData[i].items.length);
		// 	for (var j = 0; j < transData[i].items.length; ++j) {
		// 		console.log (transData[i].items[j].id);
		// 	}
		// }
		
		printData('transData: ' , transData);
}

function printData (valueName, value) {
	if (null === value) return;
	if (typeof value === "object") {
		for (var val in value) {
			printData(val, value[val]);
		}
	} else {
		var outputDatra = valueName + " : " + value;
		// console.log (outputDatra);
		fs.appendFileSync (transTreeViewFileName, outputDatra + "\n");
	}
}

// testIsOSLeafNode();
// testGetFatherObjectID();
// testTypeof();
// testIsSubString();
// testSimuTreeViewData();
testRealTreeViewData();