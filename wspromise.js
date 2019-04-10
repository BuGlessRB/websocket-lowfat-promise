!function(W)
{ "use strict";

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
    ws.on("close", () => this.openprom = 0);
    ws.on("error", this.error);
    ws.on("ping", (data) => {
      try { ws.pong(data); } catch (e) { this.error(e); }
    });
    ws.on("pong", (data) => this.pingres(data));
  }

  g.prototype.error = Error => {
    if (this.reject)
      this.reject(Error);
    else
      throw(Error);
  };

  g.prototype.open = () => this.openprom;

  g.prototype.waitforopen = async () => {
    if (this.openprom)
      await this.openprom;
    else
      this.error("Socket not open");
  }

  g.prototype.send = async (data, options) => {
    this.waitforopen();
    return new Promise((res, rej) => {
      this.reject = rej;
      try {
        this.ws.send(data, options, () => { this.reject = 0; res(); });
      } catch (e) { rej(e); }
    });
  };

  g.prototype.recv = async () => {
    this.waitforopen();
    if (this.qin.length)
      return this.qin.shift();
    return new Promise((res, rej) => {
      this.reject = rej;
      this.recvres = (data) => { this.reject = 0; res(data); };
    });
  };

  g.prototype.ping = async (data) => {
    this.waitforopen();
    return new Promise((res, rej) => {
      this.reject = rej;
      this.pingres = (data) => { this.reject = 0; res(data); };
      try {
        this.ws.ping(data);
      } catch (e) { rej(e); }
    });
  };

  g.prototype.close = (code, reason) => {
    return new Promise((res, rej) => {
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
