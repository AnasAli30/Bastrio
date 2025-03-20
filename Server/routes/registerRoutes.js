const express = require('express')
const router = express.Router()
const AUser =  require('../models/UserSchema')
const {authentication} = require("../middleware/authentication.cjs")

router.post("/register",authentication,async(req,res)=>{
    try{
        const {accountAddress} =req.query;
        const {token} = req.body;
        await AUser.create({
          address:accountAddress,
          token:token
      }).then((Data)=>{
          console.log(Data);
          res.status(200).json({message:"Registration successFull"})
      }).catch((e)=>{
          console.log(e)
          res.status(500).json({message:"Registration failed"})
      })
        
    }catch(e){
      console.log(e)
      res.status(500).json({message:"Registration failed"})
    }
})

module.exports = router;