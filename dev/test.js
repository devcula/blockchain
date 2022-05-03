const { Blockchain } = require("./blockchain");

let blockchain = new Blockchain();
blockchain.createNewBlock("nonce", "previousHash", "hash");

console.log(JSON.stringify(blockchain));