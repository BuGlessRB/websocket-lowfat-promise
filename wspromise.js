!function(W)
{ "use strict";

  var errclosed = "Socket not open";

  function g(ws) {
    this.ws = ws;
    this.openprom = new Promise((res, rej) => {
      this.reject = rej;
      ws.on("open", () => { this.reject = 0; res(); });
    });
    this.qin = [];
    ws.on("message", (data) => {
      var res;
      if (res = this.recvres)
        this.recvres = 0, res(data);
      else
        this.qin.push(data);
    });
    ws.on("close", () => {
      this.openprom = 0;
      if (this.recvres)
        this.error(errclosed);
    });
    ws.on("error", this.error);
    ws.on("ping", (data) => {
      try { ws.pong(data); } catch (e) { this.error(e); }
    });
    ws.on("pong", (data) => this.pingres(data));
  }

  g.prototype.error = function(Error) {
    if (this.reject)
      this.reject(Error);
    else
      throw(Error);
  };

  g.prototype.open = function() { return this.openprom; }

  g.prototype.send = async function(data, options) {
    await this.openprom;
    return new Promise((res, rej) => {
      this.reject = rej;
      try {
        this.ws.send(data, options, () => { this.reject = 0; res(); });
      } catch (e) { rej(e); }
    });
  };

  g.prototype.recv = async function() {
    if (this.qin.length)
      return this.qin.shift();
    return new Promise((res, rej) => {
      if (!this.openprom)
        rej(errclosed);
      else {
        this.reject = (e) => { this.recvres = 0; rej(e); };
        this.recvres = (data) => { this.reject = 0; res(data); };
      }
    });
  };

  g.prototype.ping = async function(data) {
    await this.openprom;
    return new Promise((res, rej) => {
      this.reject = rej;
      this.pingres = (data) => { this.reject = 0; res(data); };
      try {
        this.ws.ping(data);
      } catch (e) { rej(e); }
    });
  };

  g.prototype.close = function(code, reason) {
    this.openprom = 0;
    return new Promise((res, rej) => {
      if (this.reject)
        this.reject(errclosed);
      this.reject = rej;
      try {
        this.ws.close(code, reason);
      } catch (e) { rej(e); }
      this.ws.on("close", () => res());
    });
  };

  if (typeof define == "function" && define.amd)
    define("wspromise", [], g);
  else if (W.exports)
    W.exports.wspromise = g;
  else if (module.exports)
    module.exports = g;
  else
    W.wspromise = g;
}(typeof window == "object" ? window : global);
