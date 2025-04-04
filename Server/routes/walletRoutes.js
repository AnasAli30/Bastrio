const express = require('express')
const router = express.Router()
require ("dotenv").config()
const axios = require("axios")

// const router = express.Router();

router.get("/getOwnerWallet", async (req, res) => {
  try {
    // Extract query parameters from the client request
    const { owner, ownerAltAddress, limit = 100, page = 1, sort = "time-desc" } = req.query;

    if (!owner) {
      return res.status(400).json({ error: "Owner address is required" });
    }

    // Construct the external API URL
    const apiUrl = `${process.env.wallet_api}?owner=${owner}&ownerAltAddress=${ownerAltAddress || ""}&limit=${limit}&page=${page}&sort=${sort}`;

    // Make the GET request
    const response = await axios.get(apiUrl);
    // console.log(response)
    // Send the fetched data to the client
    res.json(response.data.data);
  } catch (error) {
    console.error("Error fetching owner wallet:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.get("/getActivity", async (req, res) => {
  try {
    // Extract query parameters from the client request
    const { owner, limit = 100 } = req.query;

    if (!owner) {
      return res.status(400).json({ error: "Owner address is required" });
    }

    // Construct the external API URL
    const apiUrl = `${process.env.activity_api}?owner=${owner}&ownerAltAddress&limit=${limit}`;

    // Make the GET request
    const response = await axios.get(apiUrl);
    // console.log(response)
    // Send the fetched data to the client
    res.json(response.data.data);
  } catch (error) {
    console.error("Error fetching owner wallet:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.get("/getWalletToken", async (req, res) => {
  try {
    // Extract query parameters from the client request
    const { owner } = req.query;

    if (!owner) {
      return res.status(400).json({ error: "Owner address is required" });
    }
    const apiUrl = `${process.env.apiUrl}?ownerAltAddress&owner=${owner}`;
    // Make the GET request
    const response = await axios.get(apiUrl);

const obj = response.data.data;
//  const data1 = res1.data;
   const apiUrl2= `${process.env.stat_api}?ownerAltAddress&owner=${owner}`

   const response2 = await axios.get(apiUrl2);
   const array = response2.data.data;
   const data= array.map(item => {
    const floor = obj[item.contractAddress] || null;
    return {
      ...item,
      floor,
      value: floor !== null ? floor * item.count : null 
    };
  });
  

  const sortedData = data.sort((a, b) => (b.value || 0) - (a.value || 0));


    res.json(sortedData);
  } catch (error) {
    console.error("Error fetching owner wallet:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
module.exports = router;

