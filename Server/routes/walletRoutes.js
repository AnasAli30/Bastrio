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
    console.log(response)
    // Send the fetched data to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching owner wallet:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
module.exports = router;

