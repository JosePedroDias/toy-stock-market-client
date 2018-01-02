"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


function tsmc({
  fetch,
  EventEmitter,
  EventSource,
  prefix
}) {
  function _fetch(url) {
    return fetch(url).then(res => {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      throw new TypeError("Oops, we haven't got JSON!");
    });
  }

  let username;
  let token;

  const API = {};

  // TRADER AUTH

  API.isLoggedIn = () => {
    return username;
  };

  API.register = (user, pass, money) => {
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/register/" + user + "/" + pass + "/" + money).then(o => {
        if (!o.ok) {
          return reject(o.error);
        }
        token = o.token;
        username = user;
        resolve(token);
      });
    });
  };

  API.login = (user, pass) => {
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/login/" + user + "/" + pass).then(o => {
        if (!o.ok) {
          return reject(o.error);
        }
        token = o.token;
        username = user;
        resolve(token);
      });
    });
  };

  API.logout = () => {
    if (typeof token !== "string") {
      return Promise.resolve();
    }
    const token_ = token;
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/logout/" + token_).then(o => {
        token = undefined;
        username = undefined;
        resolve();
      });
    });
  };

  // TRADER GETTERS

  API.trader = () => {
    if (token) {
      return _fetch(prefix + "/trader/" + token);
    }
    return Promise.reject("login first");
  };

  // TRADER ACTIONS

  API.bid = (stockName, price, quantity) => {
    if (token) {
      const token_ = token;
      return new Promise((resolve, reject) => {
        _fetch(prefix + "/bid/" + token_ + "/" + stockName + "/" + price + "/" + quantity).then(o => {
          if (o.ok) {
            resolve();
          } else {
            reject(o.error);
          }
        });
      });
    }
    return Promise.reject("login first");
  };

  API.ask = (stockName, price, quantity) => {
    if (token) {
      const token_ = token;
      return new Promise((resolve, reject) => {
        _fetch(prefix + "/ask/" + token_ + "/" + stockName + "/" + price + "/" + quantity).then(o => {
          if (o.ok) {
            resolve();
          } else {
            reject(o.error);
          }
        });
      });
    }
    return Promise.reject("login first");
  };

  // OPEN ENDPOINTS

  API.stocks = () => {
    return _fetch(prefix + "/stock");
  };

  API.stockLOB = stockName => {
    return _fetch(prefix + "/stock/" + stockName);
  };

  API.transactions = () => {
    return _fetch(prefix + "/transactions");
  };

  API.stats = () => {
    return _fetch(prefix + "/stats");
  };

  API.stockEventEmitter = new EventEmitter();

  const source = new EventSource(prefix + "/stream");

  source.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    //console.log("SSE", data);
    API.stockEventEmitter.emit(data.kind, data);
    API.stockEventEmitter.emit("*", data);
  });

  return API;
}

// types

exports.default = tsmc;