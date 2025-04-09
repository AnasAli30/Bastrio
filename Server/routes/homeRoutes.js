const express = require('express')
const router = express.Router()
require ("dotenv").config()
const axios = require("axios")


router.get("/getTrending", async (req, res) => {
    try {
        const response = await axios.get(`${process.env.home_api}`)
        res.status(200).json(response.data)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch home data" })
    }
    })
    router.get("/getOwnerFavorites", async (req, res) => {
        try {
          // Extract query parameters from the client request
          const { owner } = req.query;
          // Construct the external API URL
          const apiUrl = `${process.env.favorite_api}`
          const response = await axios.get(apiUrl);
        //   console.log(response.data)
          res.status(200).json(response.data);
        } catch (error) {
          console.error("Error fetching owner wallet:", error.message);
          res.status(500).json({ error: "Failed to fetch data" });
        }
      });
      

module.exports = router
