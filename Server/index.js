const express = require("express");
const cors = require('cors')
const authentication = require("./routes/authenticationRoutes")
const register = require("./routes/registerRoutes")
const update = require("./routes/updateRoutes")
const app = express();
require('dotenv').config()
const connectDB = require('./db/connect');

app.use(cors())

app.use(express.json())


app.use("/api",authentication);
app.use("/api",register);
app.use("/api",update);



connectDB(process.env.MONGO_URL).then(()=>{   
    try{
      
        app.listen(3000,async()=>{
            console.log("port active at 3000")
        })
        
        }catch(e){
        console.log(e)
        }        
}).catch((error)=>{
    console.log(error)
})
