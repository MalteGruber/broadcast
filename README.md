# BroadCast


## Server

## Client authorization process
The authorization process has two steps, the first step is not for security but to protect against overload attacks against the server.

### Stage I: Flood protection
When a client connects the client has to authorize themselves. The server responds to a new clients request to connect by sending a challenge to the client. This challenge is precomputed and may be sent multiple times unchanged. This is to minimize the load on the server by a client trying to connect; instead, the work is done by the server. Once the client has decrypted the challenge it is passed back to the answer to the server. The server compares this response with the stored answer. If the challenge is solved correctly the client passes the first authorization stage.

### Stage II: Authorization
The client is now worth the servers attention and the server sends a unique challenge to the client and the client responds back with the answer to this challenge.