# Wat ?

Very early state nodejs client library for hawkbit, implementing the [Hawkbit DDI API](https://github.com/eclipse/hawkbit/wiki/Direct-Device-Integration-API). (Direct Device Integration)

# How ?

Define a hawkbitTarget, by specifying the controller name.

```javascript
var hawkBitTarget = require('./hawkBitTarget');

hawkBitTarget.name("controller1");
```

Optionally also specify 

- hostname
- port

for it to connect to the Hawkserver instance (default = localhost:8080)

```
hawkBitTarget.hostname("test-server").port("8888").name("controller1")
```

The `poll` method will start a scheduler that will poll the Hawkbit server. The hawkbitTarget will receive the following events

- deploymentBase
- chunkFound
- cancelAction
- feedbackScheduled
- feedbackProceeding
- feedbackClosed



