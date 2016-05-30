# What ?

Very early state nodejs client library for [hawkbit](https://github.com/eclipse/hawkbit), implementing the [Hawkbit DDI API](https://github.com/eclipse/hawkbit/wiki/Direct-Device-Integration-API). (Direct Device Integration)

# How ?

Define a hawkbitClient, and provide 

- hostname (of the hawkbit server)
- port (of the hawkbit server)
- target (name of the target / thing / device as dfined in hawkbit)
- cronDefinition (to determine the polling rate)

```javascript
var hawkBitClient = require('./lib/hawkBitClient');
hawkBitClient
	.hostname("test-server")
	.port("8085")
	.target("controller1")
	.cronDefinition('1 * * * * *')
```

As soon as the `poll` method is invoked, the Hawkbit server will be contacted according to the cronDefinition.

The hawkbitClient will then receive the following events :

- deploymentBase (a new distribution is ready)
- chunkFound (a chunk was found in the distribution)
- cancelAction (a cancel action was triggered from the hawkbit server)
- feedbackScheduled (the distribution reached the scheduled state)
- feedbackProceeding (the distribution reached the proceeding state)
- feedbackClosed (the distribution reached the closed state)



The following flow can be easily implemented :

![](https://dl.dropboxusercontent.com/u/13246619/hawkbit/Hawkbit%20DDI%20happy%20flow.png)

Code :

```javascript
hawkBitClient.hostname("localhost").port("8080").target("controller1").poll(

	// A deploymentBase is available.
	// This also means that chunks / artifacts will be processed (chunkFound) .
	).on("deploymentBase",function(deploymentBase) {

	})

	// Hawkbit has cancelled a rollout. We can either confirm or reject the cancellation.
	.on("cancelAction",function(cancelAction) {

	})

	// A chunk has been found containing one or more artifacts.
	.on("chunkFound",function(chunk) {

	})

	// The distribution has reached the scheduled state.
	.on("feedbackScheduled",function(actionId) {

	})

	// The distribution has reached the proceeding state.
	.on("feedbackProceeding",function(actionId) {

	})

	// The distribution has reached the closed state.
	.on("feedbackClosed",function(actionId) {
		
	});
```	