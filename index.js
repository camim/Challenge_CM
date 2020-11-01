const axios = require('axios');
const assert = require('assert');

class Block {
	constructor(height) {
		this.height = height;
		this.url = `https://api.blockcypher.com/v1/btc/main/blocks/${height}?txstart=1&limit=1`;
		this.data = null;
		this.response = null;
	}

	checkResponseStatus() {
		try {
			assert.equal(this.response.status,200, "Failed: Block " + this.height + ": Response is not 200 code");
			return true;
		} catch(e) {
			return false;
		}
	}
}

const validateBlockchain = async (startBlock, numberOfBlocks) => {
	let n_prev, n;

	// GIVEN 10 consecutive blocks in total, starting from block 100   
	for(let i = startBlock; i < numberOfBlocks + startBlock; i++){


		// AND a block N and block N – 1 
		n_prev = new Block(i-1);
		n = new Block(i);

		// WHEN I send GET HTTP request for the N block and N – 1 block
		n_prev.response = await axios.get(n_prev.url);
		n.response = await axios.get(n.url);

		// THEN I receive valid HTTP response code 200 
		if(n.checkResponseStatus() && n_prev.checkResponseStatus()) {
			// AND the “prev_block” field of block N must match the “hash” field of block N-1
			n.data = n.response.data;
			n_prev.data = n_prev.response.data;

			try {
				assert.equal(n.data.prev_block, n_prev.data.hash, "The prev_hash field of BLOCK"
				+ n.data.height + " does not match with the hash field of BLOCK " + n_prev.data.height);
				console.log("Block " + n.height + " with Block " + n_prev.height +": well chained");
			} catch (e) {
				console.log(e);
			}
		}
	}
}

validateBlockchain(100, 10);