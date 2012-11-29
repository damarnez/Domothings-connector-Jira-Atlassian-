var Runner = function(){
	var RID = null;
	var time = 3000;
}

Runner.prototype = {

	start: function(callback){
		this.stop();
		this.RID = setInterval(callback,3000);
	},
	stop: function(){
		if (this.RID) clearInterval(this.RID);
	}
}
module.exports = Runner;