var fs = require("fs");
var transTreeViewFileName = "./transTreeViewData.txt";
/*
* transToTreeViewData
* @param {array} originData: 原始的回调数据组成的数组，每个数组都是一个pRspQryMonitor2Object对象。
* 功能: 将原始的回调数据转换成TreeView插件要求的格式;
* 实现: 1. 获取数组中每个对象的ObjectID属性对应字符串的节点的个数，并将节点个数相同的对象存储在新的数组中。
          然后以节点个数为准对这些数组进行排序，将其存储到一个大的数组中。
        2. 节点为叶子节点或是其他对象的父节点，在大的数组中逐级的为对象寻找子对象，最终扩展为完整的treeView数据结构。
*/
function transToTreeViewData (originData) {
	var sortedData = sortTreeViewData (originData);
	// console.log ('sortedData: '); console.log (sortedData);
	var treeData = buildTreeNode (sortedData);
	return treeData;
} 

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
			console.log ('TreeNodeLength: ' + i + ' , node number: ' + tmpData[i].length);
		}
	}
	return sortedData;
}

function buildTreeNode (sortedData) {
	var treeData = getChildNode(null, sortedData, 0);
	return treeData;
}

function getChildNode(curObject, sortedData, curSortedDataIndex) {
	if (curSortedDataIndex >= sortedData.length) return null;
	var treeData = [];
	for (var i = 0; i < sortedData[curSortedDataIndex].length; ++i) {
		if (curSortedDataIndex === 0 || 
		    isSubString(curObject.ObjectID, sortedData[curSortedDataIndex][i].ObjectID)) {
			treeData.push({
				'id': sortedData[curSortedDataIndex][i].ObjectID,
				// 'text': sortedData[curSortedDataIndex][i].ObjectName,				
				// 'FrontAwesomeClass': getWarningType(sortedData[curSortedDataIndex][i].WarningActive),
				'items': getChildNode(sortedData[curSortedDataIndex][i], sortedData, curSortedDataIndex+1),
			})
		}
	}
	return treeData;
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
	if (childString.substring(0, fatherString.length) === fatherString) {
		return true;
	} else {
		return false;
	}
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

// testTypeof();
// testIsSubString();
// testSimuTreeViewData();
testRealTreeViewData();