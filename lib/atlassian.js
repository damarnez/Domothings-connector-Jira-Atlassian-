var request = require('request');
var fs = require('fs');
var _ = require('underscore');
var config;
var auth;

var Atlassian = function(){
	var data = fs.readFileSync('./config/atlassian_conf.json', 'utf-8');
    config = JSON.parse(data);
    auth = "Basic " + new Buffer(config.user+':'+config.password).toString('base64');
};

Atlassian.prototype = {
	search: function(callback){

		var type = (typeof config.issueType!=='undefined') ? '%20issueType='+ config.issueType + '' : '';
	    var user = (typeof config.assignee !=='undefined' & config.assignee !=='' ) ? '%20and%20assignee=' + config.assignee + '' : '';
	    
	    path = '/rest/api/latest/search';
	   	queryString = type + '%20and%20status!=closed' + user ;
	   
	    url = config.protocol + config.domain+":"+config.port + path +"?jql="+ queryString;
	    var options = {
	    	url : url,
	    	method: 'GET',
			json: true,
			headers:[]
	    }
	    //Add headers 
		options.headers['Authorization'] = auth;
		options.headers['Content-Type'] = "application/json"
		//console.log(options);

		//Have request
		var self = this;
	    request(options, function(error, response, body) {
		    //console.log(error);
		    if(error !== null ) {
		    	console.log("Failed conect to JIRA ");
		    	return ;
		    }
		    if (response.statusCode === 401) {
		        console.log('Failed to log in to JIRA due to authentication error.');
		        return;
		    }

		    if (response.statusCode !== 200) {
		        console.log(response.statusCode + ': Unable to connect to JIRA during login.');
		        return;
		    }
		    if(body.total>0){
		    	console.log("Get JIRA info successfully.");
		    	callback(body.issues);
		    }else{
		    	callback(null);
		    }
		});    
	},
	getPriorities:function(callback){
		
		var self = this;
		this.search(function(issues){
			if(issues === null) return callback(null);
			var array_priorities = [];
			_.each(issues,function(issue){
				if(issue.fields.resolution === null){
					//console.log(issue);
					array_priorities.push(issue.fields.priority.id);
				}else{
					//console.log(issue.fields);
				}
			});
			callback(array_priorities);

		});
	}
};

module.exports = Atlassian;