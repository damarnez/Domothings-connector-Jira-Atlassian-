var request = require('request')
var fs = require('fs');
var _ = require('underscore');


var Runner  = require('./utils/Runner');
var Atlassian = require('./lib/atlassian');
var Domothings = require('./lib/domothings');
 

var atlassian = new Atlassian();
var domothings = new Domothings();
var runner = new Runner();

//Loading config
var data = fs.readFileSync('./config/semaphore_conf.json', 'utf-8');
var config = JSON.parse(data);



//Login in domothings
domothings.login(function(){
	console.log("Domothigns ***** login ok");
	//Syncronus calls

		//Loading configuration domothings
		domothings.loading_conf(function(){
			console.log("Domothings ***** load config ok");
		}),
		//Start runner 
		runner.start(function(){
			//Search if have "bugs"	
		   atlassian.getPriorities(function(priority){
		      
		      //DEFAULT MIN
		      var min = -1;
		      //If not have bugs 
		      if(priority === null || priority.length === 0 ){
		      	console.log("Atlassian ******* 'bugs' not found or all is closed" )
		      }else{
			      //Search min from priorities
			      console.log("Domothings ******** update status in semaphore");	
			      var min = _.min(priority,function(prio){
			      	return parseInt(prio);
			      });	
		      }
		      //Swich width ligth to update
		      var _ligth  = {};
		      if(_.include(config.red.priority,parseInt(min))){
		      	//console.log("-------------------- update red ---------------------");
		      	_ligth.on = config.red.port;
		      	_ligth.off = [config.yellow.port,config.green.port];

		      }else if(_.include(config.yellow.priority,parseInt(min))){
		      	//console.log("-------------------- update yellow ---------------------");
		      	_ligth.on = config.yellow.port;
		      	_ligth.off = [config.red.port,config.green.port];
		      
		      }else if(_.include(config.green.priority,parseInt(min))){
		      	
		      	//console.log("-------------------- update green ---------------------");
		      	_ligth.on = config.green.port;
		      	_ligth.off = [config.red.port,config.yellow.port];		    
		      }else{
		      	//ALL OFF
		      	_ligth.off = [config.red.port,config.yellow.port,config.green.port];		    
		      }
		      
		      //Update Device(ligth)	
		      domothings.updateSemaphore(_ligth);
		   });
		})

});
