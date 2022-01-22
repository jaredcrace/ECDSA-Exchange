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

printKey('key1', key1);
printKey('key2', key2);
printKey('key3', key3);

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const addr1 = key1.getPublic().encode('hex').slice(120,130);
const addr2 = key2.getPublic().encode('hex');
const addr3 = key3.getPublic().encode('hex');
console.log(addr1.length);

const balances = {
  addr1: 100,
  addr2: 50,
  addr3: 75,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
