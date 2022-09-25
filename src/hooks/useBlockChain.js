import React, { useEffect, useState } from "react";
import abi from "../utils/AegosFundFactory.json";
import fundabi from "../utils/AegosFund.json";
import { ethers } from "ethers";
import Web3 from 'web3'
import moment from "moment";
const contractABI = abi.abi;
const fundABI = fundabi.abi;
const contractAddress = "0xF3F21E078bFb559B5A70eeB11B79248ADf5606c3";
const ethereumChainDetails = {
  chainName: "Moonbase Alpha",
  rpcUrl: "https://rpc.api.moonbase.moonbeam.network",
  //1287 in hex
  chainId: "0x507",
};
const useBlockChain = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allFunds, setAllFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chainConnected, setChainConnected] = useState(1);
  const [metaMaskBalance, setMetaMaskBalance] = useState('');

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
			const web3 = new Web3(window.ethereum)
      const networkId = await web3.eth.net.getId()
      if (web3.utils.toHex(networkId) !== ethereumChainDetails.chainId) {
        setChainConnected(0);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = ethers.utils.getAddress(accounts[0]);
        console.log("Found an authorized account:", account);
        initiateUserAccount(account)
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const switchEthereumChain = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethereumChainDetails.chainId }]
      });
      console.log('Successfully switched to chain 9000');
      setChainConnected(1);
    } catch (switchError) {
      console.error(switchError);
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ethereumChainDetails],
          });
          setChainConnected(1);
        } catch (addError) {
          console.error(addError);
        }
      }
      // handle other "switch" errors
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      switchEthereumChain();

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      initiateUserAccount(accounts[0])
    } catch (error) {
      console.log(error);
    }
  };

  const initiateUserAccount = async (account) => {
    try {
      //get Crypto assets data from Metamask wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account)
      console.log("balance: ",ethers.utils.formatEther(balance))
      setMetaMaskBalance(ethers.utils.formatEther(balance))

      //Inititate Aegos connection
      console.log("Connected", account);
      setCurrentAccount(account);
      getContracts();

    } catch (error) {
      console.log(error);
    }
  }

  const createFund = async ({
    name,
    requiredNbOfParticipants,
    recurringAmount,
    startDate,
    duration,
  }) => {
    console.log(
      "upcoming data",
      name,
      requiredNbOfParticipants,
      recurringAmount,
      startDate,
      duration
    );
    switchEthereumChain();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const aegosFundFactory = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    //pledgeCollateral is a temp calculation, tobe removed once the UI provide an actual collateral pledge
    const pledgeCollateral = parseInt(parseInt(recurringAmount) * parseInt(requiredNbOfParticipants) * 1.2).toFixed(0);
    console.log("pledgeCollateral ", pledgeCollateral)
    const createFundTxn = await aegosFundFactory.createAegosFund(
      name,
      requiredNbOfParticipants,
      recurringAmount,
      startDate,      //parseInt((new Date(startDate).getTime() / 1000).toFixed(0)),
      duration,
      { value: pledgeCollateral }
    );

  
    await getContracts(recurringAmount);
  };

  const joinFund = async (data) => {
    const {
      // collateral,
       address } = data;

  
    pledgeCollateral(address, data.amount, data.requiredNumberOfParticipants);
    deposit(data);
  };

  const pledgeCollateral = async (address, amount, requiredNumberOfParticipants) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const aegosFund = new ethers.Contract(address, fundABI, signer);

    const collateral = parseInt(parseInt(amount) * parseInt(requiredNumberOfParticipants) * 1.2).toFixed(0);
    const collateralReceipt = await aegosFund.collateral({ value: collateral });
    console.debug("collateralReceipt: ",collateralReceipt);
  }

  const deposit = async (data) => {
    const { address } = data;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const aegosFund = new ethers.Contract(address, fundABI, signer);

    const depositReceipt  = await aegosFund.deposit({ value: parseInt(data.amount) });
    console.debug("depositReceipt",depositReceipt);

    const balance = await (aegosFund.participants(contractAddress));
    console.debug("balance", balance);
  };

  const getContracts = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const aegosFundFactory = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      const contracts = await aegosFundFactory.getAegosFunds();
      const contractsDetails = await Promise.all(
        contracts.map(async (d) => {
          const row = await getFundData(d);

          return {
            fundName: row.name.toString(),
            duration: row.duration.toString() + " months",
            amount: row.recurringAmount.toString(),
            requiredNumberOfParticipants:
              row.requiredNbOfParticipants.toString(),
            startDate: moment(row.startDate).format("DD/MM/YYYY HH:mm"),
            currency: "USDT",
            users: row.participantsAddress,
            address: d,
          };
        })
      );
      let uniqueFunds = [...allFunds, ...contractsDetails]
      uniqueFunds = new Map(uniqueFunds.map((v) => [v.address, v])).values();
      setAllFunds([...uniqueFunds])
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setChainConnected(0);
      console.error('getContracts error');
    }
  };

  const getFundData = async (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const aegosFund = new ethers.Contract(address, fundABI, provider);

    const name = await aegosFund.name();
    const requiredNbOfParticipants = await aegosFund.requiredNbOfParticipants();
    const recurringAmount = await aegosFund.recurringAmount();
    const startDate = await aegosFund.startDate()*1000;
    const duration = await aegosFund.duration();
    try {
      const participantsAddress = await aegosFund.getAllParticipants();
      //const participantsAddress = await aegosFund.participants(aegosFund.address);
 //     console.log("participantsAddress", participantsAddress)
      return {
        name,
        requiredNbOfParticipants,
        recurringAmount,
        startDate,
        duration,
        participantsAddress,
        //participantsAddress: participantsAddress.map((d) => d.toString()),
      };
    } catch (error) {
     // alert("error ", error)
      console.error("error: ", error)
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getContracts();
  }, [chainConnected]);

  return {
    allFunds,
    currentAccount,
    chainConnected,
    connectWallet,
    getContracts,
    isLoading,
    createFund,
    joinFund,
    metaMaskBalance,
  };
};

export default useBlockChain;

// const connectWallet = async () => {
//     try {
//       const { ethereum } = window;

//       if (!ethereum) {
//         alert("Get MetaMask!");
//         return;
//       }

//       const accounts = await ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       console.log("Connected", accounts[0]);
//       setCurrentAccount(accounts[0]);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     //alert("getContracts before!");
//     checkIfWalletIsConnected();
//     getContracts();
//     //alert("getContracts after!");
//   }, []);

//   const getFundData = async (address) => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const aegosFund = new ethers.Contract(address, fundABI, provider);

//     const name = await aegosFund.name();

//     const requiredNbOfParticipants =
//       await aegosFund.requiredNbOfParticipants();
//     const recurringAmount = await aegosFund.recurringAmount();
//     const startDate = await aegosFund.startDate();
//     const duration = await aegosFund.duration();

//     return {
//       name,
//       requiredNbOfParticipants,
//       recurringAmount,
//       startDate,
//       duration,
//     };
//   };

//   const getContracts = async () => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     const aegosFundFactory = new ethers.Contract(
//       contractAddress,
//       contractABI,
//       provider
//     );

//     const contracts = await aegosFundFactory.getAegosFunds();

//     const contractsDetails = contracts.map(await getFundData);
//     let contractsData = [];

//     console.log(contracts);
//     console.log(await contractsDetails);

//     setAllFunds([]);
//     await contractsDetails.forEach((element) => {
//       element.then((result) => {
//         console.log(result);
//         contractsData.push(result);
//         setAllFunds((oldFunds) => [...oldFunds, result]);
//       });
//     });
//     console.log("--> ", await contractsData);
//     console.log("--> allFunds -:> ", allFunds);

//     setMappedFunds(
//       allFunds.map((row) => {
//         return {
//           fundName: row.name.toString(),
//           duration: row.duration.toString() + " months",
//           amount: row.recurringAmount.toString(),
//           currency: "INR",
//         };
//       })
//     );
//   };
