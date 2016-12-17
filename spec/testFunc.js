var fs = require("fs");
var transTreeViewFileName = "./transTreeViewData.txt";
var funcFile = require ("./transTreeViewData.js");
var transToTreeViewData = funcFile.transToTreeViewData;
var getFatherObjectID = funcFile.getFatherObjectID;
var quickSort = funcFile.quickSort;
var sortTreeViewData = funcFile.sortTreeViewData;
var OSLeafNode = funcFile.isisOSLeafNode;
var isSubString = funcFile.isSubString;

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

function testQuickSort () {
	var originalData = [4,3,2,1];
	var sortedData = quickSort(originalData, compNumb);
	console.log (originalData);
	console.log (sortedData);
}

function compNumb (val1, val2) {
	return val1 < val2
}

function testCompareString () {
	var str1 = "Ab.b.c";
	var str2 = "AA.b.c";
	console.log (str1.toLowerCase());
	console.log (str2.toLowerCase());
	console.log (str1.toLowerCase() > str2.toLowerCase());
}

function testSortTreeViewData () {
	var originData = require ("./treeViewData.json").rspData;
	var sortedData = sortTreeViewData(originData);
	
	for (i = 0; i < sortedData.length; ++i) {
		// console.log (sortedData[i].length);
		for (var j = 0; j < sortedData[i].length; ++j) {
			console.log (sortedData[i][j].ObjectID);
		}
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


// testCompareString();
// testQuickSort();
// testIsOSLeafNode();
// testGetFatherObjectID();
// testTypeof();
// testIsSubString();
// testSortTreeViewData();
// testSimuTreeViewData();
testRealTreeViewData();