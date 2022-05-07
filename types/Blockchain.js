const Block = require('./Block');
const Transaction = require('./Transaction');
const crypto = require('crypto');
const currentNodeHost = process.argv[3];
const currentNodePort = process.argv[2];

class Blockchain{
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];
        this.currentNodeUrl = `${currentNodeHost}:${currentNodePort}`;
        this.networkNodes = [];
        //Create a genesis block
        this.createNewBlock(0, '0', '0');
    }

    createNewBlock(nonce, previousBlockHash, hash){
        const index = this.chain.length + 1;
        const newBlock = new Block(index, this.pendingTransactions, nonce, previousBlockHash, hash);

        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }

    getLastBlock(){
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction(amount, sender, recipient){
        return new Transaction(amount, sender, recipient);
    }

    addTransaction(transaction){
        this.pendingTransactions.push(transaction);

        //I am assuming that we are trying to return the index of the block of which this transaction is going to be part of
        //When we create first transaction, this.getLastBlock() will return undefined, so commenting below line.
        // return this.getLastBlock().index + 1;
        //Using below syntax because it's basically the same thing
        // return this.chain.length + 1;
        return this.chain.length + 1;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce){
        const stringData = previousBlockHash + String(nonce) + currentBlockData;
        return crypto.createHash('sha256').update(stringData).digest('hex');
    }

    mineBlock(previousBlockHash, currentBlockData){
        let nonce = 0;
        if(typeof currentBlockData !== "string"){
            currentBlockData = JSON.stringify(currentBlockData);
        }
        while(true){
            const hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            if(hash.startsWith("0000")){
                return { nonce, hash };
            }
            nonce++;
        }
    }

    isBlockchainValid(blockchain){
        if(!Array.isArray(blockchain) || blockchain.length === 0){
            return false;
        }

        //Verify genesis block
        const genesisBlock = blockchain[0];
        if( genesisBlock.previousBlockHash !== "0"
        || genesisBlock.hash !== "0"
        || genesisBlock.nonce !== 0
        || genesisBlock.transactions.length !== 0
        ){
            console.log("Invalid genesis block..");
            return false;
        }

        //Now verify the entire chain
        for(let i = 1; i < blockchain.length; i++){
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];
            if(currentBlock.previousBlockHash !== previousBlock.hash){
                //Chain is not valid
                console.log("Invalid previous hash match..");
                return false;
            }
            const currentBlockData = {
                transactions: currentBlock.transactions //It should be same format and value as used while mining
            }
            const currentBlockHash = this.hashBlock(previousBlock.hash, JSON.stringify(currentBlockData), currentBlock.nonce);
            if(!currentBlockHash.startsWith("0000")){
                console.log("Incorrect block hash..");
                return false;
            }
        }
        //Chain is valid
        return true;
    }
}

module.exports = Blockchain;
