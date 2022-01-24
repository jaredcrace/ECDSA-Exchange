const express = require('express');

const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const port = 3042;


function printKey(keyMsg, key) {
  console.log(`key msg: ${keyMsg}`)
  console.log({
    privateKey: key.getPrivate().toString(16),
    publicX: key.getPublic().x.toString(16),
    publicY: key.getPublic().y.toString(16),
    public: key.getPublic().encode('hex')
  });
}

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

class Wallet {
  constructor(key, amount) {
    this.key = key;
    this.address = key.getPublic().encode('hex').slice(128,130);
    this.amount = amount;
  }

  print(){
    console.log(this.key, this.address, this.amount);
  }
}

class Exchange {
  constructor() {
    this.walletObjList = [];
    this.walletStrList = [];
  }

  createNewWallet(startAmount) {
    const key = ec.genKeyPair();
    const newWallet = new Wallet(key, startAmount);

    this.walletObjList.push(newWallet);
    this.walletStrList.push(newWallet.address);
  }

  isValidWalletAddress(address) {
    if(this.walletStrList.length == 0) {
      return;
    }

    if(address.length != this.walletStrList[0].length){
      console.log(`address wrong size: ${address}`);
      return;
    }

    if(this.walletStrList.includes(address)){
      console.log(`valid address: ${address}`);
      return true;
    }

    console.log(`not valid address: ${address}`);
    return false;
  }

  getWalletBalance(address) {
    if(!this.isValidWalletAddress(address)){
      return;
    }
    for(var i=0; i<this.walletObjList.length; i++){
      if(address == this.walletObjList[i].address) {
        var balance = this.walletObjList[i].amount;
        console.log(`${address}, balance: ${balance}`);
        return balance; 
      }
    }
    return;
  }

  updateWalletBalance(address, amount) {
    if(!this.isValidWalletAddress(address)){
      return;
    }
    for(var i=0; i<this.walletObjList.length; i++){
      if(address == this.walletObjList[i].address) {
        var startBalance = this.walletObjList[i].amount;
        this.walletObjList[i].amount += parseInt(amount,10);
        var endBalance = this.walletObjList[i].amount;
        console.log(`${address}, startBalance: ${startBalance}, endBalance: ${endBalance}`);
      }
    }
    return;
  }

  printVerbose() {
    for(var i=0; i<this.walletObjList.length; i++) {
      console.log(this.walletObjList[i]);
    }
    console.log(this.walletStrList);
  }
}

// create the wallets
var EXCHANGE = new Exchange();
EXCHANGE.createNewWallet(100);
EXCHANGE.createNewWallet(50);
EXCHANGE.createNewWallet(75);
EXCHANGE.printVerbose();

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  if(!EXCHANGE.isValidWalletAddress(address)){
    return;
  }
  const b = {
    balance: EXCHANGE.getWalletBalance(address)
  } 
  res.send(b);
});

app.post('/send', (req, res) => {
  const {sender, recipient, signature, amount} = req.body;

  if(!EXCHANGE.isValidWalletAddress(sender) || !EXCHANGE.isValidWalletAddress(recipient)){
    return;
  }

  EXCHANGE.updateWalletBalance(sender, -amount);
  EXCHANGE.updateWalletBalance(recipient, amount);
  res.send({ balance: EXCHANGE.getWalletBalance(sender)});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
