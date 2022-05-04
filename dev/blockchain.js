const Block = require('./block');
const Transaction = require('./transaction');
const crypto = require('crypto');

class Blockchain{
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];

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
        const newTransaction = new Transaction(amount, sender, recipient);
        this.pendingTransactions.push(newTransaction);

        //I am assuming that we are trying to return the index of the block of which this transaction is going to be part of
        //When we create first transaction, this.getLastBlock() will return undefined, so commenting below line.
        // return this.getLastBlock().index + 1;
        //Using below syntax because it's basically the same thing
        return this.chain.length + 1;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce){
        const stringData = previousBlockHash + String(nonce) + JSON.stringify(currentBlockData);
        return crypto.createHash('sha256').update(stringData).digest('hex');
    }

    mineBlock(previousBlockHash, currentBlockData){
        let nonce = 0;
        while(true){
            const hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            if(hash.startsWith("0000")){
                return { nonce, hash };
            }
            nonce++;
        }
    }
}

module.exports = Blockchain;