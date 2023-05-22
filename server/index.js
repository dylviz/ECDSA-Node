const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
	//Private key: e9c4f0d8f45cd6a1e19a6600b1abf472731fa1dd3d62676a164bedfbd46518ab
	"02434a6c47517b0e1411c21fd586e21e9f98edf1c50c3164372241c1ff622985bb": 100,
	//private key: 4b19712dfd254790aff5f5687c8e3f60450e5de0e14690ae7d99735b6c614e73
	"031f8f0b7f18a7219b9bb80e9f698324dd159bcd674840f9bafa2944d5dba15274": 50,
	//private key: 17186f0be11d883b563c9e6db54e65f99cc405edfb58dfcb497c8a43f1c4e409
	"03b82c660e7f4507f7e03c1983a6272ef5ebc345ce7a96fc7bd0be5e0bbb2e9957": 75,
};

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", (req, res) => {
	const { sender, amount, recipient, signature, msgHash } = req.body;
	// const hashMessage = JSON.stringify(msgHash);
	const hashMessage = new Uint8Array(Object.values(msgHash));
	const sig = new Uint8Array(Object.values(signature));

	console.log("server got: " + JSON.stringify(req.body));
	console.log("hashMessage: " + hashMessage);
	console.log("Sig: " + sig);

	// //verify
	const isSigned = secp.verify(sig, hashMessage, sender);
	if (!isSigned) {
		res
			.status(400)
			.send({ message: "You are not qualified to make this transaction." });
	} else {
		setInitialBalance(sender);
		setInitialBalance(recipient);

		if (balances[sender] < amount) {
			res.status(400).send({ message: "Not enough funds!" });
		} else {
			balances[sender] -= amount;
			balances[recipient] += amount;
			res.send({ balance: balances[sender] });
		}
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}
