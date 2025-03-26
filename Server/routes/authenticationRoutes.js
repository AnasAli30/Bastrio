const express = require('express')
const router = express.Router()
const ethers = require('ethers')
const jwt = require('jsonwebtoken')
require("dotenv").config()

router.post("/authentication",async(req,res)=>{
    try{
        const {accountAddress} =req.query;
        const {signature} = req.body;

        console.log(accountAddress,signature)

        if(!signature || !accountAddress){
            res.status(500).json({message:"Authentication Failed"})
          }
          const message = `Welcome to Bastrio!

Click to sign in and accept the Terms of Service and Privacy Policy.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: ${accountAddress}`;

          const recoverAddress = ethers.utils.verifyMessage(message,signature);
          console.log(recoverAddress)
          if(recoverAddress.toLowerCase()===accountAddress.toLowerCase()){

const token = jwt.sign({accountAddress},process.env.SECRET_TOKEN)
            res.status(200).json({
                message:"Authentication success",
                token:token
            })
          }else{
            throw new Error("Recovered address not same as account Address")
          }

    }catch(e){
        console.log(e)
        res.status(500).json({message:"Authentication failed"})
    }
})

module.exports = router;