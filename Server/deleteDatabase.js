const mongoose = require('mongoose');
require('dotenv').config()
const User = require('./models/UserSchema'); // Replace 'User' with your model file path

const uri = process.env.MONGO_URL; // Replace with your MongoDB connection string

async function deleteModelCollection() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        await mongoose.connection.db.dropCollection(User.collection.collectionName);
        console.log(`Collection '${User.collection.collectionName}' deleted successfully`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        if (error.codeName === 'NamespaceNotFound') {
            console.log('Collection does not exist.');
        } else {
            console.error('Error deleting collection:', error);
        }
    }
}

deleteModelCollection();
