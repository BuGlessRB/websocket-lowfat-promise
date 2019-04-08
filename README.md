<h1>wspromise</h1>

websock-lowfat-promise is a zero-dependencies low-fat-promisified ws-websocket
library.

## Requirements

It runs inside any webbrowser or node environment that supports promises.

It can be used with most existing websocket libraries.

## Basic usage

The following sample code should speak for itself:

```js
const WebSocket = require("ws");
const wspromise = require("websocket-lowfat-promise");

async function runme() {
  const wsp = new wsppromise(new WebSocket("wsp://foo.com/bar"));
  await wsp.open();
  await wsp.send("Hello world!  Send me a response please.");
  var response = await wsp.recv();
  console.log(response);
  await wsp.close();
  console.log("Socket has been closed");
}

runme();
```

## Reference documentation


### API

Specified parameters:
- `websocket`<br />
  Should be a websocket obtained from any of the existing websocket
  libraries compatible with the event-system provided by `ws`.

Exposed API-list:
- `new wspromise(websocket)`<br />
  Creates a reference to the promisified version of the passed websocket.
- `this.open()`<br />
  Returns a promise that resolves once the connection has been established.
- `this.send(data, options)`<br />
  Returns a promise that resolves once the data-frame has been sent.
- `this.recv()`<br />
  Returns a promise that resolves once a data-frame has been received.
- `this.ping()`<br />
  Returns a promise that resolves once a pong has been received from the
  far end.
- `this.close()`<br />
  Returns a promise that resolves once the connection has been closed.

## References

Card-carrying member of the `zerodeps` movement.
