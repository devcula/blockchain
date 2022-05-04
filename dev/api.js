const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const uuid = require('uuid');

const nodeAddress = uuid.v1().split("-").join("");
// console.log(nodeAddress);

const Blockchain = require("./blockchain");

const newcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
    res.send("Hello world!");
});

app.get("/blockchain", function(req, res){
    res.send(newcoin);
});

app.post("/transaction", function (req, res) {
    const { amount, sender, recipient } = req.body;
    if(!sender || !recipient || isNaN(amount)){
        return res.status(400).send("Invalid request");
    }
    const blockIndex = newcoin.createNewTransaction(Number(amount), sender, recipient);
    res.status(200).send(`Transaction will be added in block ${blockIndex}.`);
});

app.get("/mine", function (req, res) {
    const lastBlock = newcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: newcoin.pendingTransactions
    }

    const { nonce, hash } = newcoin.mineBlock(previousBlockHash, currentBlockData);
    const newBlock = newcoin.createNewBlock(nonce, previousBlockHash, hash);
    //Reward for mining
    newcoin.createNewTransaction(12.5, "REWARD_SERVER", nodeAddress);
    res.status(200).json(newBlock);
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});