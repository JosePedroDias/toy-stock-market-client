# toy stock market client

A common API for interacting with the HTTP interface of toy-stock-market.
Works on both a browser and node.js, given you provide it implementations of the fetch API, EventSource and EventEmitter.

## API

the default exported symbol is a function expecting an object defining:

* `fetch`
* `EventEmitter`
* `EventSource`
* `prefix`

this in turn returns the TSM client API, which consists of:

    {
      // TRADER AUTH
      isLoggedIn = (): ?string
      register = (user: string, pass: string, money: number): Promise<string>
      login = (user: string, pass: string): Promise<string>
      logout = (): Promise<void>

      // TRADER GETTERS
      trader = (): Promise<TraderWoPass>

      // TRADER ACTIONS
      bid = (stockName: string, price: number, quantity: number): Promise<void>
      ask = (stockName: string, price: number, quantity: number): Promise<void>

      // OPEN ENDPOINTS
      stocks = (): Promise<Array<string>>
      stockLOB = (stockName: string): Promise<StockLOB>
      transactions = (): Promise<Array<Transaction>>
      stats = (): Promise<Stats>

      // STREAM EVENTS
      stockEventEmitter:EventEmitter
    }
