"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Socks5Server: () => Socks5Server,
  createServer: () => createServer,
  defaultConnectionHandler: () => connectionHandler_default
});
module.exports = __toCommonJS(src_exports);

// src/Server.ts
var import_net2 = __toESM(require("net"));

// src/types.ts
var Socks5ConnectionCommand = /* @__PURE__ */ ((Socks5ConnectionCommand2) => {
  Socks5ConnectionCommand2[Socks5ConnectionCommand2["connect"] = 1] = "connect";
  Socks5ConnectionCommand2[Socks5ConnectionCommand2["bind"] = 2] = "bind";
  Socks5ConnectionCommand2[Socks5ConnectionCommand2["udp"] = 3] = "udp";
  return Socks5ConnectionCommand2;
})(Socks5ConnectionCommand || {});
var Socks5ConnectionStatus = /* @__PURE__ */ ((Socks5ConnectionStatus2) => {
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["REQUEST_GRANTED"] = 0] = "REQUEST_GRANTED";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["GENERAL_FAILURE"] = 1] = "GENERAL_FAILURE";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["CONNECTION_NOT_ALLOWED"] = 2] = "CONNECTION_NOT_ALLOWED";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["NETWORK_UNREACHABLE"] = 3] = "NETWORK_UNREACHABLE";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["HOST_UNREACHABLE"] = 4] = "HOST_UNREACHABLE";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["CONNECTION_REFUSED"] = 5] = "CONNECTION_REFUSED";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["TTL_EXPIRED"] = 6] = "TTL_EXPIRED";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["COMMAND_NOT_SUPPORTED"] = 7] = "COMMAND_NOT_SUPPORTED";
  Socks5ConnectionStatus2[Socks5ConnectionStatus2["ADDRESS_TYPE_NOT_SUPPORTED"] = 8] = "ADDRESS_TYPE_NOT_SUPPORTED";
  return Socks5ConnectionStatus2;
})(Socks5ConnectionStatus || {});

// src/Connection.ts
var Socks5Connection = class {
  constructor(server, socket) {
    this.errorHandler = () => {
    };
    this.metadata = {};
    this.socket = socket;
    this.server = server;
    socket.on("error", this.errorHandler);
    socket.pause();
    this.handleGreeting();
  }
  readBytes(len) {
    return new Promise((resolve) => {
      let buf = Buffer.allocUnsafe(len);
      let offset = 0;
      const dataListener = (chunk) => {
        const readAmount = Math.min(chunk.length, len - offset);
        chunk.copy(buf, offset, 0, readAmount);
        offset += readAmount;
        if (offset < len) return;
        this.socket.removeListener("data", dataListener);
        this.socket.push(chunk.subarray(readAmount));
        resolve(buf);
        this.socket.pause();
      };
      this.socket.on("data", dataListener);
      this.socket.resume();
    });
  }
  async handleGreeting() {
    const ver = (await this.readBytes(1)).readUInt8();
    if (ver !== 5) return this.socket.destroy();
    const authMethodsAmount = (await this.readBytes(1)).readUInt8();
    if (authMethodsAmount > 128 || authMethodsAmount === 0) return this.socket.destroy();
    const authMethods = await this.readBytes(authMethodsAmount);
    const authMethodByteCode = this.server.authHandler ? 2 : 0;
    if (!authMethods.includes(authMethodByteCode)) {
      this.socket.write(Buffer.from([
        5,
        // Version 5 - Socks5
        255
        // no acceptable auth modes were offered 
      ]));
      return this.socket.destroy();
    }
    this.socket.write(Buffer.from([
      5,
      // Version 5 - Socks5
      authMethodByteCode
      // The chosen auth method, 0x00 for no auth, 0x02 for user-pass
    ]));
    if (this.server.authHandler) this.handleUserPassword();
    else this.handleConnectionRequest();
  }
  async handleUserPassword() {
    await this.readBytes(1);
    const usernameLength = (await this.readBytes(1)).readUint8();
    const username = (await this.readBytes(usernameLength)).toString();
    const passwordLength = (await this.readBytes(1)).readUint8();
    const password = (await this.readBytes(passwordLength)).toString();
    this.username = username;
    this.password = password;
    let calledBack = false;
    const acceptCallback = () => {
      if (calledBack) return;
      calledBack = true;
      this.socket.write(Buffer.from([
        1,
        // User pass auth version
        0
        // Success
      ]));
      this.handleConnectionRequest();
    };
    const denyCallback = () => {
      if (calledBack) return;
      calledBack = true;
      this.socket.write(Buffer.from([
        1,
        // User pass auth version
        1
        // Failure
      ]));
      this.socket.destroy();
    };
    const resp = await this.server.authHandler(this, acceptCallback, denyCallback);
    if (resp === true) acceptCallback();
    else if (resp === false) denyCallback();
  }
  async handleConnectionRequest() {
    await this.readBytes(1);
    const commandByte = (await this.readBytes(1))[0];
    const command = Socks5ConnectionCommand[commandByte];
    if (!command) return this.socket.destroy();
    this.command = command;
    await this.readBytes(1);
    const addrType = (await this.readBytes(1)).readUInt8();
    let address = "";
    switch (addrType) {
      case 1:
        address = (await this.readBytes(4)).join(".");
        break;
      case 3:
        const hostLength = (await this.readBytes(1)).readUInt8();
        address = (await this.readBytes(hostLength)).toString();
        break;
      case 4:
        const bytes = await this.readBytes(16);
        for (let i = 0; i < 16; i++) {
          if (i % 2 === 0 && i > 0) address += ":";
          address += `${bytes[i] < 16 ? "0" : ""}${bytes[i].toString(16)}`;
        }
        break;
      default:
        this.socket.destroy();
        return;
    }
    const port = (await this.readBytes(2)).readUInt16BE();
    if (!this.server.supportedCommands.has(command)) {
      this.socket.write(Buffer.from([5, 7 /* COMMAND_NOT_SUPPORTED */]));
      return this.socket.destroy();
    }
    this.destAddress = address;
    this.destPort = port;
    let calledBack = false;
    const acceptCallback = () => {
      if (calledBack) return;
      calledBack = true;
      this.connect();
    };
    if (!this.server.rulesetValidator) return acceptCallback();
    const denyCallback = () => {
      if (calledBack) return;
      calledBack = true;
      this.socket.write(Buffer.from([
        5,
        2,
        // connection not allowed by ruleset
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0
      ]));
      this.socket.destroy();
    };
    const resp = await this.server.rulesetValidator(this, acceptCallback, denyCallback);
    if (resp === true) acceptCallback();
    else if (resp === false) denyCallback();
  }
  connect() {
    this.socket.removeListener("error", this.errorHandler);
    this.server.connectionHandler(this, (status) => {
      if (Socks5ConnectionStatus[status] === void 0) throw new Error(`"${status}" is not a valid status.`);
      this.socket.write(Buffer.from([
        5,
        Socks5ConnectionStatus[status],
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0
      ]));
      if (status !== "REQUEST_GRANTED") {
        this.socket.destroy();
      }
    });
    this.socket.resume();
  }
};

// src/connectionHandler.ts
var import_net = __toESM(require("net"));
function connectionHandler_default(connection, sendStatus) {
  if (connection.command !== "connect") return sendStatus("COMMAND_NOT_SUPPORTED");
  connection.socket.on("error", () => {
  });
  const stream = import_net.default.createConnection({
    host: connection.destAddress,
    port: connection.destPort
  });
  stream.setNoDelay();
  let streamOpened = false;
  stream.on("error", (err) => {
    if (!streamOpened) {
      switch (err.code) {
        case "EINVAL":
        case "ENOENT":
        case "ENOTFOUND":
        case "ETIMEDOUT":
        case "EADDRNOTAVAIL":
        case "EHOSTUNREACH":
          sendStatus("HOST_UNREACHABLE");
          break;
        case "ENETUNREACH":
          sendStatus("NETWORK_UNREACHABLE");
          break;
        case "ECONNREFUSED":
          sendStatus("CONNECTION_REFUSED");
          break;
        default:
          sendStatus("GENERAL_FAILURE");
      }
    }
  });
  stream.on("ready", () => {
    streamOpened = true;
    sendStatus("REQUEST_GRANTED");
    connection.socket.pipe(stream).pipe(connection.socket);
  });
  connection.socket.on("close", () => stream.destroy());
  return stream;
}

// src/Server.ts
var Socks5Server = class {
  constructor() {
    this.supportedCommands = /* @__PURE__ */ new Set(["connect"]);
    this.connectionHandler = connectionHandler_default;
    this.server = import_net2.default.createServer((socket) => {
      socket.setNoDelay();
      this._handleConnection(socket);
    });
  }
  listen(...args) {
    this.server.listen(...args);
    return this;
  }
  close(callback) {
    this.server.close(callback);
    return this;
  }
  setAuthHandler(handler) {
    this.authHandler = handler;
    return this;
  }
  disableAuthHandler() {
    this.authHandler = void 0;
    return this;
  }
  setRulesetValidator(handler) {
    this.rulesetValidator = handler;
    return this;
  }
  disableRulesetValidator() {
    this.rulesetValidator = void 0;
    return this;
  }
  setConnectionHandler(handler) {
    this.connectionHandler = handler;
    return this;
  }
  useDefaultConnectionHandler() {
    this.connectionHandler = connectionHandler_default;
    return this;
  }
  // Not private because someone may want to inject a duplex stream to be handled as a connection
  _handleConnection(socket) {
    new Socks5Connection(this, socket);
    return this;
  }
};

// src/index.ts
function createServer(opts) {
  const server = new Socks5Server();
  if (opts?.auth) server.setAuthHandler((conn) => {
    return conn.username === opts.auth.username && conn.password === opts.auth.password;
  });
  if (opts?.port) server.listen(opts.port, opts.hostname);
  return server;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Socks5Server,
  createServer,
  defaultConnectionHandler
});
