const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: true
    },
    x: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
        unique: true,  // Ensure email is unique
        sparse: true   // Allows some users to have no email
    },
    isVerified: {
        type: Boolean,
        default: false  // Default is unverified
    },
    verificationToken: {
        type: String,
        required: false  // Only needed when email verification is pending
    }
});

const AUser = mongoose.model("AUser", UserSchema);

module.exports = AUser;
