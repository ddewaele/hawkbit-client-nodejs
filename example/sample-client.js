var hawkBitClient = require('../lib/hawkBitClient');

// This is an example Hawkbit client representing the target/thing "controller2" 
// that connects to a hawkbit instance (localhost:8080) 
// The client will poll hawkbit every second (* * * * * *)
// As soon as the poll method is executed, events can come in.

hawkBitClient
	.hostname("localhost")
	.port("8080")
	.target("controller2")
	.cronDefinition('* * * * * *')
	.poll(

	// When a deploymentBase is made available by hawkbit 
	// (ex: an admin has assigned a software distribution to the target)
	// the client will be notified of that. This also means that chunks / artifacts 
	// will be processed (see chunkFound event) .
	).on("deploymentBase",function(deploymentBase) {
		
		this.reportFeedback(deploymentBase.id,"deploymentBase","scheduled","none","[custom msg] : Scheduling the deployment");
		//this.reportFeedback(deploymentBase.id,"deploymentBase","canceled","failure","[custom msg] : Canceling deployment client side");

	})

	// When Hawkbit has cancelled a rollout the client will also be notified of that.
	// That that point, he can either confirm or reject the cancellation.
	.on("cancelAction",function(cancelAction) {
		console.log("cancelAction detected");
		this.reportFeedback(cancelAction.id,"cancelAction","closed","success","[custom msg] : nodejs client responding to hawkbit cancel action.");
	})

	// A chunk has been found containing one or more artifacts.
	.on("chunkFound",function(chunk) {

	})


	// When an artifact was found in the response, the client needs to decide what to do with it.
	// In this case, depending on the type (Configuration Module VS Software Module), it will take action.
	.on("artifactFound",function(artifact,chunk) {

	    var name = chunk.name;
	    var type = chunk.part;

		console.log('artifactFound chunck : ' + name + " / " + type);

		if (type === "Configuration Module") {
			this.streamArtifactToDisk(artifact,"/tmp/config",chunk);
		} else if (type === "Software Module") {
			this.streamArtifactToDisk(artifact,"/tmp/sw",chunk);
		} else {
			console.log("Unsupported type")
		}

	})

	.on("fileSaved",function(file,chunk) {
		console.log("file " + file + " saved...");
	})	

	// Scheduled state
	.on("feedbackScheduled",function(actionId) {
		this.reportFeedback(actionId,"deploymentBase","proceeding","none","[custom msg] : Proceeding with the deployment");
	})

	// Proceeding state.
	// In this example, we introduce some random behavior
	// (depending on the action we'll either close or cancel the distribution).
	.on("feedbackProceeding",function(actionId) {

		if (actionId % 2==0) {
			this.reportFeedback(actionId,"deploymentBase","closed","failure","[custom msg] : Closing deployment with failed state");
		} else if (actionId % 3==0) {
			this.reportFeedback(actionId,"deploymentBase","canceled","failure","[custom msg] : Canceling deployment client side");
		} else {
			this.reportFeedback(actionId,"deploymentBase","closed","success","[custom msg] : Closing deployment with success state");
		}
	})

	// Closed state
	.on("feedbackClosed",function(actionId) {
		console.log("Deployment with actionId " + actionId + " is closed.");
	});

