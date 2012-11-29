var request = require('request');
var fs = require('fs');
var _ = require('underscore');


var config;
var config_semaphore;

var path = "http://domothings.com/"; 
var cookie = "";

var device_red    = "";
var device_yellow = "";
var device_green  = "";

 

var Domothings = function(){

	//Loading config data to connect domothings
    var data = fs.readFileSync('./config/domothings_conf.json', 'utf-8');
    config = JSON.parse(data);

    //Loading generic config data
    var data2 = fs.readFileSync('./config/semaphore_conf.json', 'utf-8');
	config_semaphore = JSON.parse(data2);
};
Domothings.prototype = {
	login:function(callback){
		//Login function	
		var options = {
	    	url : path+"loginApp",
	    	method: 'POST',
			json: true,
			body:{"username":config.user,"password":config.password,"submited":1} 
	    }
	    //Make request
	    request(options, function(error, response, body) {
			//Get Cookie
			cookie = response.headers['set-cookie'];
			callback();
		});
	},
	loading_conf: function(callback){
		//To get config in domothings get rooms 
		this.rooms(function(){
			callback();
		});
	},
	rooms: function(callback){
		//Get rooms  
		var options = {
	    	url : path+"api/rooms",
	    	method: 'GET',
			json: true,
			headers:[]
		}
		options.headers['set-coockie'] = cookie; 
		var self = this;

		request(options, function(error, response, body) {
			console.log("loading devices .... "+body);
			//console.log(body); 
			//Get first (default) room
			var array_id = body[0].devices;	
			//Iterate devices
			_.each(array_id,function(id){
				
				self.device(id);
			});

			callback();
		});

	},
	device:function(id){

		var options = {
	    	url : path+"api/devices/"+id,
	    	method: 'GET',
			json: true,
			headers:[]
		}
		options.headers['set-coockie'] = cookie; 
		request(options, function(error, response, body) {
			 //console.log(body); 

			//Swich wath device is the ligths 
		    if(_.include(body.ports,config_semaphore.red.port)){
		      	device_red = body;
		     	console.log("red device loading .....");  
		      	
	        }else if(_.include(body.ports,config_semaphore.yellow.port)){
	  	    	device_yellow = body;
		      	console.log("yellow device loading .....");  
		      
	        }else if(_.include(body.ports,config_semaphore.green.port)){
		      	device_green = body;
		      	console.log("green device loading .....");  	 

            }else{
            	console.log("Remember configure semaphore_conf.json width the correspond ports of arduino ");
            }
			 
		});
	},
	updateSemaphore:function(ligth){
			var self = this;
			// console.log(ligth);
			//Update device on
			this.updateDevice(ligth.on,1,function(){
				console.log("device on "+ligth.on);
			});

			//Update device off
			_.each(ligth.off,function(id_ligth){
				self.updateDevice(id_ligth,0,function(){
					console.log("device off "+id_ligth);
				});
			});



	},
	updateDevice:function(port,val,callback){
			var _update;
			  //console.log(device_red.ports);
			  //console.log(device_yellow.ports);
			  //console.log(device_green.ports);
			  //console.log(port);	
			if(_.include(device_red.ports,port)){
					//console.log("update device RED ");
					_update = device_red;
					_update.val = val;
					// console.log(device_red);	
			}else if(_.include(device_yellow.ports,port)){
				   //console.log("update device YELLOW ");
					_update = device_yellow;
					_update.val = val;
					// console.log(device_yellow);	
			}else if(_.include(device_green.ports,port)){
					//console.log("update device GREEN ");
					_update = device_green;
					_update.val = val;
					// console.log(device_green);	
			}else{
				console.log("Devices is not loading ");
				return callback();
			}
			 // console.log("update device");
			 // console.log(_update);
			
			var options = {
		    	url : path+"api/devices/"+_update._id,
		    	method: 'PUT',
				json: true,
				body:_update,
				headers:[]
			}
			options.headers['set-coockie'] = cookie; 
			request(options, function(error, response, body) {
				 //console.log(body);	
				 console.log(body.name+" is update");
				 callback();
			});
	}

};

module.exports = Domothings;