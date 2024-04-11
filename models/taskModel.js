const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    userEmail: {
        type: String
    }
});

// Create a model using the schema
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
