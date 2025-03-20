const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    id:{
        type:String,
        required:false
    },
    address:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    token:{
        type:String,
        required:true
    }
})

const AUser = mongoose.model("AUser",UserSchema)

module.exports = AUser;