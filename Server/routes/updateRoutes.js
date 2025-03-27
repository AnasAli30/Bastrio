const express = require('express')
const router = express.Router()
const AUser =  require('../models/UserSchema')
const {authentication} = require("../middleware/authentication.cjs")

router.post("/update",authentication,async(req,res)=>{
    try{
        const {accountAddress} =req.query;
        const {name,email,x} = req.body;
        if (!accountAddress) {
            return res.status(400).json({ message: "Account address is required" });
        }
      const user =  await AUser.findOne({
          address:accountAddress
      })

      if(name) user.id = name;
      if(email) user.email = email;
      if(x) user.x = x;

      const saved = await user.save();

      res.status(200).json({ message: "Update successful" });
        
    }catch(e){
      console.log(e)
      res.status(500).json({message:"Registration failed"})
    }
})

module.exports = router;