# Socket.io + Next.js example

## How to use

Install it and run:

```bash
npm install
[PORT=XXXX] node server
```

## The idea behind the example

This example show how to use [socket.io](https://socket.io/) inside a Next.js application. It uses `getInitialProps` to fetch the old messages from a HTTP endpoint as if it was a Rest API. The example combine the WebSocket server with the Next server, in a production application you should split them as different services.
