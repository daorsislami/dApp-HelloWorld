
const alchemyKey = process.env.REACT_APP_ALCHEMY_FULLPATH;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const contractABI = require('../contract-abi.json')
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export const helloWorldContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);


export const loadCurrentMessage = async () => {
    const message = await helloWorldContract.methods.message().call();
    console.log('loading message: ', message);
    return message;
};

export const connectWallet = async () => {

    // ##### Some documentation #####
    // window.ethereum ---> is a global API injected by MetaMask and other wallet providers that allows websites to 
    //                      request user's Ethereum accounts. If provided, it can read data from the blockchains the user
    //                      is connected to, and suggest that the user sign messages and transactions.

    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "👆🏽 Write a message in the text-field above",
                address: addressArray[0],
            }
            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            }
        }
    } else {
        // Here most likely a user who wants to interact with our dApp doesn't have a wallet set up 
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "} 🦊 {" "}
                        <a target="_blank" href="{`https://metamask.io/download`}">
                            You must install MetaMask, a virtual Ethereum wallet, in your browser.
                        </a>
                    </p>
                </span>
            )
        };
    }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    message: "👆🏽 Write a message in the text-field above. "
                };
            } else {
                return {
                    address: "",
                    message: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            }
        }
    } else {
        // Here most likely a user who wants to interact with our dApp doesn't have a wallet set up 
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "} 🦊 {" "}
                        <a target="_blank" href="{`https://metamask.io/download`}">
                            You must install MetaMask, a virtual Ethereum wallet, in your browser.
                        </a>
                    </p>
                </span>
            )
        };
    }
};

export const updateMessage = async (address, message) => {

    //input error handling
    if (!window.ethereum || address === null) {
      return {
        status:
          "💡 Connect your Metamask wallet to update the message on the blockchain.",
      };
    }
  
    if (message.trim() === "") {
      return {
        status: "❌ Your message cannot be an empty string.",
      };
    }
  
    //set up transaction parameters
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: address, // must match user's active address.
      data: helloWorldContract.methods.update(message).encodeABI(),
    };
  
    //sign the transaction
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return {
        status: (
          <span>
            ✅{" "}
            <a target="_blank" href={`https://holesky.etherscan.io/tx/${txHash}`}>
              View the status of your transaction on Etherscan!
            </a>
            <br />
            ℹ️ Once the transaction is verified by the network, the message will
            be updated automatically.
          </span>
        ),
      };
    } catch (error) {
      return {
        status: "😥 " + error.message,
      };
    }
  };
