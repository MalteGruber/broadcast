# broadCast.js
Contains ws connection handling.
## Boilerplate
Simple example of getting broadcast.js upp and running
```
var b=require("./broadcast.js")
b.startWithName("the_name_of_the_client")
b.setOnConnectListener(function(){});
b.setOnDisonnectListener(function(){})
b.setOnReadyListener(function(){
	b.broadcast({hej:"HELLO!"});
});
b.setOnMessageListener(function(msg){
	console.log("GOT MESSAGE",msg);
})

```
