const Blockchain = require("../types/Blockchain");

let bitcoin = new Blockchain();
bitcoin.createNewBlock(54211211, "AJSHH123H137813N", "HH32UIT379DUA");
bitcoin.createNewTransaction("5000", "Abhinav", "Manoj");
bitcoin.createNewTransaction("500", "Abhinav", "Manoj");
bitcoin.createNewTransaction("200", "Abhinav", "Manoj");
bitcoin.createNewBlock(878515454, "1UUH2JEWY78U23ASSD", "IUOIYGUVJB32312JAS");
bitcoin.createNewTransaction("500", "Abhishek", "Sanjay");
console.log(bitcoin);

console.log(bitcoin.hashBlock(bitcoin.chain[bitcoin.chain.length - 1].hash, bitcoin.pendingTransactions, 123456));

console.log(bitcoin.mineBlock(bitcoin.hashBlock(bitcoin.chain[bitcoin.chain.length - 1].hash, bitcoin.pendingTransactions)));
