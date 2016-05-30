var hawkBitClient = require('../lib/hawkBitClient');

hawkBitClient.hostname("localhost").port("8080").target("controller1").poll(

	// A deploymentBase is available.
	// This also means that chunks / artifacts will be processed (chunkFound) .
	).on("deploymentBase",function(deploymentBase) {
		
		this.reportFeedback(deploymentBase.id,"deploymentBase","scheduled","none","[custom msg] : Scheduling the deployment");
		//this.reportFeedback(deploymentBase.id,"deploymentBase","canceled","failure","[custom msg] : Canceling deployment client side");

	})

	// Hawkbit has cancelled a rollout. We can either confirm or reject the cancellation.
	.on("cancelAction",function(cancelAction) {
		console.log("cancelAction detected");
		this.reportFeedback(cancelAction.id,"cancelAction","closed","success","[custom msg] : nodejs client responding to hawkbit cancel action.");
	})

	// A chunk has been found containing one or more artifacts.
	.on("chunkFound",function(chunk) {
	    console.log('chunck : ' + chunk.name);

	    for(var i=0 ; i<chunk.artifacts.length ; i++) {
			var artifact = chunk.artifacts[i];
	    	
	    	if (artifact) {
		    	var fileName = artifact.filename;
		    	var fileHref = artifact["_links"]["download-http"].href;
		    	console.log('artifact download : ' + fileHref);
		    	//streamFileToDisk(fileHref,fileName)
		    } else {
		    	console.log("No artifact found in " + chunk.name);
		    }
	    }

	})

	// Scheduled state
	.on("feedbackScheduled",function(actionId) {
		this.reportFeedback(actionId,"deploymentBase","proceeding","none","[custom msg] : Proceeding with the deployment");
	})

	// Proceeding state
	.on("feedbackProceeding",function(actionId) {
		//this.reportFeedback(actionId,"deploymentBase","closed","success","[custom msg] : Closing deployment with success state");
		this.reportFeedback(actionId,"deploymentBase","closed","failure","[custom msg] : Closing deployment with failed state");
		//this.reportFeedback(actionId,"deploymentBase","canceled","failure","[custom msg] : Canceling deployment client side");
	})

	// Closed state
	.on("feedbackClosed",function(actionId) {
		console.log("Deployment with actionId " + actionId + " is closed.");
	});

