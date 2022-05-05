const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const uuid = require('uuid');
const axios = require('axios');
const port = process.argv[2];

const nodeAddress = uuid.v1().split("-").join("");

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

    //Reward for mining
    newcoin.createNewTransaction(12.5, "REWARD_SERVER", nodeAddress);

    const currentBlockData = {
        transactions: newcoin.pendingTransactions
    }

    const { nonce, hash } = newcoin.mineBlock(previousBlockHash, currentBlockData);
    const newBlock = newcoin.createNewBlock(nonce, previousBlockHash, hash);
    res.status(200).json(newBlock);
});

//register a node and broadcast it to the network
app.post("/register-and-broadcast-node", async function(req, res){
    console.log(`Received request for register and broadcast node..`);
    const newNodeUrl = req.body.url;
    if(!newNodeUrl){
        return res.status(400).send("url is mandatory");
    }
    if (!newcoin.networkNodes.includes(newNodeUrl) && newcoin.currentNodeUrl !== newNodeUrl){
        //Register the URL into current node
        newcoin.networkNodes.push(newNodeUrl);
        console.log(`Registered ${newNodeUrl} ..`);
    }

    //Broadcast the URL to other nodes
    const broadcastPromises = newcoin.networkNodes.map(nodeUrl => {
        return new Promise(async resolve => {
            try{
                const config = {
                    url: `${nodeUrl}/register-node`,
                    method: "POST",
                    data: {
                        url: newNodeUrl
                    }
                }
                await axios(config);
                console.log(`Broadcasted ${newNodeUrl} to node ${nodeUrl}..`);
            }
            catch(err){
                console.log(`Error while broadcasting ${newNodeUrl} to node ${nodeUrl}..`, err.message);
            }
            return resolve();
        });
    });

    await Promise.all(broadcastPromises);
    //Broadcast done. Now need to register the existing nodes to the new node using bulk endpoint
    const config = {
        url: `${newNodeUrl}/register-nodes-bulk`,
        method: "POST",
        data: {
            urls: [...newcoin.networkNodes, newcoin.currentNodeUrl]
        }
    }
    try{
        await axios(config);
        console.log(`Bulk registered nodes in the new node ${newNodeUrl}..`);
    }
    catch(err){
        console.log(`Error during bulk registration of nodes to the new node ${newNodeUrl}..`, err.message);
    }
    res.status(200).send("Register and broadcast completed...");
});

//just register a node to the network without broadcasting it
app.post("/register-node", function(req, res){
    console.log("Received request for node registration..");
    const newNodeUrl = req.body.url;
    if (!newNodeUrl) {
        return res.status(400).send("url is mandatory");
    }
    if (!newcoin.networkNodes.includes(newNodeUrl) && newcoin.currentNodeUrl !== newNodeUrl) {
        //Register the URL into current node
        newcoin.networkNodes.push(newNodeUrl);
        console.log(`Registered ${newNodeUrl} ..`);
    }
    res.status(200).send(`${newNodeUrl} registered..`);
});

app.post("/register-nodes-bulk", function (req, res) {
    console.log("Received request for bulk registration..");
    let newNodes = req.body.urls;
    if(typeof newNodes === "string"){
        try{
            newNodes = JSON.parse(newNodes);    
        }
        catch(err){}
    }

    if (!newNodes || !Array.isArray(newNodes)) {
        return res.status(400).send("urls is mandatory parameter and should be an array..");
    }

    newNodes.forEach(newNodeUrl => {
        if (!newcoin.networkNodes.includes(newNodeUrl) && newcoin.currentNodeUrl !== newNodeUrl) {
            //Register the URL into current node
            newcoin.networkNodes.push(newNodeUrl);
            console.log(`Registered ${newNodeUrl} ..`);
        }
    });
    
    res.status(200).send(`Bulk registrations successful..`);
});

app.listen(port, () => {
    console.log(`Node ${nodeAddress} listening on port ${port}...`);
});