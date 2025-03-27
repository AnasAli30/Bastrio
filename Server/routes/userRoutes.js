const express = require('express')
const router = express.Router()
const AUser = require('../models/UserSchema')

router.get("/user", async (req, res) => {
    try {
        const { accountAddress } = req.query;

        // Check if accountAddress is provided
        if (!accountAddress) {
            return res.status(400).json({ message: "Account address is required" });
        }


        const user = await AUser.findOne({ address:accountAddress });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({user});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Found failed" });
    }
});

module.exports = router;
