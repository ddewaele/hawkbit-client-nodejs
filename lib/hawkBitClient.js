var util = require('util');
var EventEmitter = require('events').EventEmitter;

var rest = require('restler');
var fs = require('fs');


var CronJob = require('cron').CronJob;

var HawkBitTarget = function() {

	var self = this;

	this.init = function(cronDefinition) {

		new CronJob(this.cronDefinition || "1 * * * * *", function() {
		  self.checkSwUpdateReady();
		}, null, true);

	}

	this.hostname = function(hostname) {
		this._hostname = hostname;
		return this;
	}

	this.port = function(port) {
		this._port = port;
		return this;
	}

	this.baseUrl = function() {
		var hostname = this._hostname || "localhost";
		var port = this._port || 8080;
		return 'http://' + hostname + ':' + port + '/default/controller/v1';
	}

	this.cronDefinition = function(cronDefinition) {
		this.cronDefinition = cronDefinition
		return this;
	}

	this.target = function(target) {
		this.target = target;
		return this;
	}
	
    this.poll = function() {
		this.init();
		return this;
    }

	this.checkSwUpdateReady = function () {

		rest.get(this.baseUrl() + '/' + this.target).on('complete', function(result) {
		  if (result instanceof Error) {
		    console.log('Error:', result.message);
		  } else {
		  	var json = JSON.parse(result);
		  	var cancelAction = json["_links"].cancelAction;
		  	var deploymentBase = json["_links"].deploymentBase;

		  	if (cancelAction) {
				self.getCancelAction(cancelAction.href);
		  	} else {
				console.log(".");
		  	}
		  	
		  	if (deploymentBase) {
		  		self.getDeploymentInfo(deploymentBase.href);
		  	} else {
		  		console.log(".");
		  	}
		  }
		});
	}


	this.getDeploymentInfo = function(href) {

		rest.get(href).on('complete', function(result) {
			
			if (result instanceof Error) {
				console.log('Error:', result.message);

			} else {

				setImmediate(function() {
		        	self.emit("deploymentBase",result);
		    	});		  		

				var json = result;
				var id = json.id;
				var chunks = json.deployment.chunks;

				for(var i=0 ; i<chunks.length ; i++) {
					var chunk = chunks[i];

					setImmediate(function() {
			        	self.emit("chunkFound",chunk);
			    	});		


				    for(var j=0 ; j<chunk.artifacts.length ; j++) {
						var artifact = chunk.artifacts[j];
				    	
				    	if (artifact) {
					    	self.emit("artifactFound",artifact,chunk);
					    } else {
					    	console.log("No artifact found in " + chunk.name);
					    }
				    }

				}
			}
		});
	}  


	this.getCancelAction = function (href) {

		rest.get(href).on('complete', function(result) {
		  
		  if (result instanceof Error) {
		    console.log('Error:', result.message);
		  } else {
			setImmediate(function() {
	        	self.emit("cancelAction",result);
	    	});		  	
		  }
		});

	}	


	this.downloadArtifact = function(chunk) {

	}


	this.reportFeedback = function(actionId,action,execution,resultFinished,msg) {

		var data = {
				    "id": actionId,
				    "status": {
				        "execution": execution,
				        "result": {
				            "finished": resultFinished,
				            "progress": {}
				        },
				        "details": [
	            			msg
	        			]
				    }
				};

		var url = this.baseUrl() + '/' + this.target + '/' + action + '/' + actionId + '/feedback';
		
		console.log("Posting feedback " + JSON.stringify(data) + " for actionId " + actionId);			
		rest.postJson(url, data).on('complete', function(data, response) {
			console.log("Hawkbit response code " + response.statusCode);
			
			if (response.statusCode == 200) {

				switch(execution) {
				    case "scheduled":
						setImmediate(function() {self.emit("feedbackScheduled",actionId)});	
				        break;
				    case "proceeding":
				        setImmediate(function() {self.emit("feedbackProceeding",actionId)});	
				        break;
				    case "closed":
				        setImmediate(function() {self.emit("feedbackClosed",actionId)});	
				        break;
				    default:
				        // should not happen
				}

			}
			if (response.statusCode == 201) {
				// you can get at the raw response like this...
			}
		});

	}	


	this.streamArtifactToDisk = function(artifact,outputFolder,chunk) {

    	var fileName = artifact.filename;
    	var fileHref = artifact["_links"]["download-http"].href;

		var file = fs.createWriteStream(outputFolder + "/" + fileName);

		rest.get(fileHref, function(res) {
		    res.pipe(file);
		    file.on('finish', function() {
		    	setImmediate(function() {self.emit("fileSaved",file,chunk)});	
		        file.close(function(err) {
		            console.log('done');
		        });
		    });
		});
	}

	this.streamFileToDisk = function(fileUrl,fileName,chunk) {

		var file = fs.createWriteStream(fileName);

		rest.get(fileUrl, function(res) {
		    res.pipe(file);
		    file.on('finish', function() {
		    	setImmediate(function() {self.emit("fileSaved",file,chunk)});	
		        file.close(function(err) {
		            console.log('done');
		        });
		    });
		});
	}

	this.censor = function(censor) {
	  var i = 0;

	  return function(key, value) {
	    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
	      return '[Circular]'; 

	    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
	      return '[Unknown]';

	    ++i; // so we know we aren't using the original object anymore

	    return value;  
	  }
	}	  
};

util.inherits(HawkBitTarget, EventEmitter);
module.exports = new HawkBitTarget();