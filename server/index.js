const express = require('express');

const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const port = 3042;

const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

function printKey(keyMsg, key) {
  console.log(`key msg: ${keyMsg}`)
  console.log({
    privateKey: key.getPrivate().toString(16),
    publicX: key.getPublic().x.toString(16),
    publicY: key.getPublic().y.toString(16),
    public: key.getPublic().encode('hex')
  });
}

//printKey('key1', key1);
//printKey('key2', key2);
//printKey('key3', key3);

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const addr1 = key1.getPublic().encode('hex').slice(128,130);
const addr2 = key2.getPublic().encode('hex').slice(128,130);
const addr3 = key3.getPublic().encode('hex').slice(128,130);


const balances = {
  ['_' + addr1]: 100,
  ['_' + addr2]: 50,
  ['_' + addr3]: 75,
}

console.log(balances);

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  var addr = '_' + address;
  const balance = balances[addr] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  var addr_sender = '_' + sender;
  var addr_recipient = '_' + recipient;
  balances[addr_sender] -= amount;
  balances[addr_recipient] = (balances[addr_recipient] || 0) + +amount;
  res.send({ balance: balances[addr_sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
