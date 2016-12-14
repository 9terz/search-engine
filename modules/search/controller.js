'use strict';
let express = require('express');
var neo4j = require('neo4j-driver').v1;
// neo4j config
let driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "me8s"));
let session = driver.session();

let Index = (req,res) => {
  res.render('index',{
    name: 'ter'
  }
);
};

let Debug = (req,res) => {
  cal_tf_idf(res,req.body.kw,(json) => {
    res.json(json)
  });
}

let ShowResult = (req,res) => {
  if(req.body.tf == '1' && req.body.pr == null )
  {
    cal_tf_idf(res,req.body.kw,(json) => {
      console.log(req.body)
      res.render('answer',
    {
      json: json
    })
    });
  }
  else if(req.body.pr == '3' && req.body.tf == null)
  {
  cal_pr(res,req.body.kw,(json) => {
    console.log(req.body)
    res.render('answer',
  {
    json: json
  })
  });
}
else if(req.body.pr == '3' && req.body.tf == '1')
{
  cal_mix(res,req.body.kw,(json) => {
    console.log(req.body)
    res.render('answer',
  {
    json: json
  })
  });
}
};
let cal_pr = function(res,input,callback){
	let n = 0;
	let json = [];
  console.log('prkub')
	session
		.run("MATCH (n:Page) WHERE n.TextSearch =~ '.*"+input+".*' RETURN n")
		.then(function(result){
			// console.log(result);
				// console.log(result.records);
			result.records.forEach(function(record){
				n += 1;
			});
			result.records.forEach(function(record){
				// console.log(record._fields[0].properties);
				let weight = cal_weight(n,record._fields[0].properties.TextSearch);
        let pr = record._fields[0].properties.pr;
				let anchor_text = record._fields[0].properties.anchor_text;
				let name = record._fields[0].properties.name;
				let text = split_text(record._fields[0].properties.TextSearch);
        let title = record._fields[0].properties.title;
				json.push({'weight':weight,'anchor_text':anchor_text,'name':name,'text':text,'pr':pr,'title':title});
			});
				json = sortByKey(json,'pr');
				callback(json)
				// console.log(json);

		})
		.catch(function(err){
			console.log("err");
			res.send('err');
		});
}

let cal_mix = function(res,input,callback){
	let n = 0;
	let json = [];
  console.log('mix kub');
	session
		.run("MATCH (n:Page) WHERE n.TextSearch =~ '.*"+input+".*' RETURN n")
		.then(function(result){
			// console.log(result);
				// console.log(result.records);
			result.records.forEach(function(record){
				n += 1;
			});
			result.records.forEach(function(record){
				// console.log(record._fields[0].properties);
				let weight = cal_weight(n,record._fields[0].properties.TextSearch);
        let pr = record._fields[0].properties.pr;
        let mixweight = (weight*0.3) + (pr*0.7)
				let anchor_text = record._fields[0].properties.anchor_text;
				let name = record._fields[0].properties.name;
				let text = split_text(record._fields[0].properties.TextSearch);
        let title = record._fields[0].properties.title;
				json.push({'mixweight':mixweight,'weight':weight,'anchor_text':anchor_text,'title':title,'name':name,'text':text,'pr':pr});
			});
				json = sortByKey(json,'mixweight');
				callback(json)
				// console.log(json);

		})
		.catch(function(err){
			console.log("err");
			console.log(err);
			res.send('err');
		});
}

let cal_tf_idf = function(res,input,callback){
	let n = 0;
	let json = [];
  console.log('1 kub')
	session
		.run("MATCH (n:Page) WHERE n.TextSearch =~ '.*"+input+".*' RETURN n")
		.then(function(result){
			// console.log(result);
				// console.log(result.records);
			result.records.forEach(function(record){
				n += 1;
			});
			result.records.forEach(function(record){
				// console.log(record._fields[0].properties);
				let weight = cal_weight(n,record._fields[0].properties.TextSearch);
				let anchor_text = record._fields[0].properties.anchor_text;
				let name = record._fields[0].properties.name;
        let pr = record._fields[0].properties.pr;
				let text = split_text(record._fields[0].properties.TextSearch);
        let title = record._fields[0].properties.title;
				json.push({'weight':weight,'anchor_text':anchor_text,'name':name,'text':text,'title':title});
			});
				json = sortByKey(json,'weight');
				callback(json)
				// console.log(json);

		})
		.catch(function(err){
			console.log("err");
			console.log(err);
			res.send('err');
		});
}


// weight tf-idf
let cal_weight = function(n,str){
	let tf = cal_tf(str);
  let allDocuments = 466;
	let idf = cal_idf(allDocuments,n);
	return tf*idf;
}
// tf
let cal_tf = function(str){
	return str.split('partner').length;
}
// idf
let cal_idf = function(N,n){
	return Math.log(N/n);
}
// sort json
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}
// text split
let split_text = function(string){
	return string.substring(0, 100);
}

module.exports = {
  Index: Index,
  ShowResult: ShowResult,
  Debug: Debug
};
