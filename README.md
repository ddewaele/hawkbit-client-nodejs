# What ?

Very early state nodejs client library for hawkbit, implementing the [Hawkbit DDI API](https://github.com/eclipse/hawkbit/wiki/Direct-Device-Integration-API). (Direct Device Integration)

# How ?

Define a hawkbitTarget, and provide 

- hostname (of the hawkbit server)
- port (of the hawkbit server)
- target (name of the target / thing / device as dfined in hawkbit)


```javascript
var hawkBitTarget = require('./hawkBitTarget');
hawkBitTarget.hostname("test-server").port("8888").target("controller1")
```

The `poll` method will start a scheduler that will poll the Hawkbit server. The hawkbitTarget will receive the following events

- deploymentBase
- chunkFound
- cancelAction
- feedbackScheduled
- feedbackProceeding
- feedbackClosed



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