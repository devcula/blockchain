const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain{
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];
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
}

module.exports = Blockchain;