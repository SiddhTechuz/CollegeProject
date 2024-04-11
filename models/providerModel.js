const mongoose = require('mongoose');


const RegisterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    service: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true
    }
});

// Create a model using the schema
const Register = mongoose.model('Register', RegisterSchema);

module.exports = Register;
