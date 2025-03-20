const jwt = require('jsonwebtoken')
require("dotenv").config()

const authentication = (req,res,next)=>{
        const {token} = req.body;
    // const token = req.headers['x-access-token']
    if(!token){
        res.status(500).json({message:"Authentication Failed"})
    }
    const decoded =  jwt.verify(token,process.env.SECRET_TOKEN)
    req.accountAddress=decoded.accountAddress
    next()


}
module.exports={authentication}