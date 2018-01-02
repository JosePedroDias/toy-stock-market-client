// @flow

// types

export type Transaction = {
  from: string,
  to: string,
  price: number,
  quantity: number,
  stock: string,
  when: number
};

export type BidAskDataLOB = {
  price: number,
  quantity: number
};

export type StockLOB = {
  bids: Array<BidAskDataLOB>,
  asks: Array<BidAskDataLOB>
};

export type HashOfNumber = { [string]: number };

export type TraderWoPass = {
  money: number,
  owns: HashOfNumber // stockName -> quantity
};

export type Stats = {
  traders: number,
  tokens: number,
  stocks: number,
  queuedActions: number
};

type SimpleAnswer = { ok: boolean, error: string };
type TokenAnswer = { ok: boolean, token: string, error: string };

type EventEmitter = any;

type EventSource = any;

type Fetch = Function;

function tsmc({
  fetch,
  EventEmitter,
  EventSource,
  prefix
}: {
  fetch: Fetch,
  EventEmitter: EventEmitter,
  EventSource: EventSource,
  prefix: string
}) {
  function _fetch(url: string) {
    return fetch(url).then(res => {
      const contentType: string = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      throw new TypeError("Oops, we haven't got JSON!");
    });
  }

  let username: ?string;
  let token: ?string;

  const API = {};

  // TRADER AUTH

  API.isLoggedIn = (): ?string => {
    return username;
  };

  API.register = (
    user: string,
    pass: string,
    money: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/register/" + user + "/" + pass + "/" + money).then(
        (o: TokenAnswer) => {
          if (!o.ok) {
            return reject(o.error);
          }
          token = o.token;
          username = user;
          resolve(token);
        }
      );
    });
  };

  API.login = (user: string, pass: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/login/" + user + "/" + pass).then((o: TokenAnswer) => {
        if (!o.ok) {
          return reject(o.error);
        }
        token = o.token;
        username = user;
        resolve(token);
      });
    });
  };

  API.logout = (): Promise<void> => {
    if (typeof token !== "string") {
      return Promise.resolve();
    }
    const token_: string = token;
    return new Promise((resolve, reject) => {
      _fetch(prefix + "/logout/" + token_).then((o: any) => {
        token = undefined;
        username = undefined;
        resolve();
      });
    });
  };

  // TRADER GETTERS

  API.trader = (): Promise<TraderWoPass> => {
    if (token) {
      return _fetch(prefix + "/trader/" + token);
    }
    return Promise.reject("login first");
  };

  // TRADER ACTIONS

  API.bid = (
    stockName: string,
    price: number,
    quantity: number
  ): Promise<void> => {
    if (token) {
      const token_: string = token;
      return new Promise((resolve, reject) => {
        _fetch(
          prefix +
            "/bid/" +
            token_ +
            "/" +
            stockName +
            "/" +
            price +
            "/" +
            quantity
        ).then((o: SimpleAnswer) => {
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

  API.ask = (
    stockName: string,
    price: number,
    quantity: number
  ): Promise<void> => {
    if (token) {
      const token_: string = token;
      return new Promise((resolve, reject) => {
        _fetch(
          prefix +
            "/ask/" +
            token_ +
            "/" +
            stockName +
            "/" +
            price +
            "/" +
            quantity
        ).then((o: SimpleAnswer) => {
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

  API.stocks = (): Promise<Array<string>> => {
    return _fetch(prefix + "/stock");
  };

  API.stockLOB = (stockName: string): Promise<StockLOB> => {
    return _fetch(prefix + "/stock/" + stockName);
  };

  API.transactions = (): Promise<Array<Transaction>> => {
    return _fetch(prefix + "/transactions");
  };

  API.stats = (): Promise<Stats> => {
    return _fetch(prefix + "/stats");
  };

  API.stockEventEmitter = new EventEmitter();

  const source = new EventSource(prefix + "/stream");

  source.addEventListener("message", ev => {
    const data: any = JSON.parse(ev.data);
    //console.log("SSE", data);
    API.stockEventEmitter.emit(data.kind, data);
    API.stockEventEmitter.emit("*", data);
  });

  return API;
}

export default tsmc;
