import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { sha256 } from "ethereum-cryptography/sha256.js";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";

function Transfer({ address, setBalance }) {
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [privateKey, setPrivateKey] = useState("");
	const [showModal, setShowModal] = useState(false);

	const setValue = (setter) => (evt) => setter(evt.target.value);

	const msg = sendAmount + ", " + recipient;

	const openModal = (evt) => {
		evt.preventDefault();
		setShowModal(true);
	};

	const closeModal = (evt) => {
		evt.preventDefault();
		setShowModal(false);
	};

	async function transfer(evt) {
		evt.preventDefault();

		//get signature - returns { r: bigint; s: bigint; recovery: number }
		const msgHash = sha256(utf8ToBytes(msg));
		const signature = secp256k1.sign(msgHash, privateKey);
		// const [signature, recoveryBit] = await secp256k1.sign(msgHash, privateKey, {
		// 	recovered: true,
		// });
		// const signature = await secp256k1.sign(msgHash, privateKey);
		console.log("sig: " + signature);

		try {
			const {
				data: { balance },
			} = await server.post(`send`, {
				sender: address,
				amount: parseInt(sendAmount),
				recipient,
				signature,
				msgHash: msgHash,
			});
			setBalance(balance);
			closeModal();
		} catch (ex) {
			alert(ex.response.data.message);
		}
	}

	return (
		<div>
			<form className="container transfer" onSubmit={openModal}>
				<h1>Send Transaction</h1>

				<label>
					Send Amount
					<input
						placeholder="1, 2, 3..."
						value={sendAmount}
						onChange={setValue(setSendAmount)}
					></input>
				</label>

				<label>
					Recipient
					<input
						placeholder="Type an address, for example: 0x2"
						value={recipient}
						onChange={setValue(setRecipient)}
					></input>
				</label>

				<input type="submit" className="button" value="Transfer" />
			</form>

			{showModal && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={closeModal}>
							&times;
						</span>
						<form className="container transfer" onSubmit={transfer}>
							<h1>Sign Message</h1>

							<label>
								private key (normally held by MM or other wallet):
								<input
									placeholder="000000..."
									value={privateKey}
									onChange={setValue(setPrivateKey)}
								></input>
							</label>

							<label>Message: {msg}</label>

							<input type="submit" className="button" value="Sign" />
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Transfer;
