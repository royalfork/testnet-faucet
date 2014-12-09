Testnet-Faucet API
==============

Simple Testnet Faucet API in Node.js

Requires bitcoind and redis.  Set configuration params in config.js.

Each requesting IP is restricted to a limited amount of bitcoins each hour. There are no limits to the number of requests, as long as your IP stays below it's limit.

Run - node app.js

POST /
  {address: "ADDRESS", amount: "AMOUNT IN SATOSHIS"}

  Responds with:
  {id: "HASH OF TXN", limit: "AMOUNT IN SATOSHIS" }
  
  or:
  {error: "ERROR MESSAGE" }

GET /
  Responds with:
  {ip: "YOUR IP", limit: "MAX WITHDRAWAL IN SATOSHIS"}

----

