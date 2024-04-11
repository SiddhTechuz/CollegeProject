// Import necessary libraries
const cron = require('node-cron');
const Task = require('../models/taskModel') // Import your Task model
const nodemailer = require('nodemailer');
const Email = require('../utils/email')
// Create a cron job to run every minute (adjust as needed)
cron.schedule('* * * * *', async () => {
    try {
        // Get current date and time

        // Loop through matching tasks
        // for (const task of matchingTasks) {
        //     // Send email notification to the user
        //     // Send email
        //     await new Email(newUser,null).sendReminder(matchingTasks)
        //     // Update reminderSent flag to prevent sending duplicate reminders
        //     task.reminderSent = true;
        //     await task.save();
        // }
    } catch (error) {
        console.error('Error occurred while sending reminders:', error);
    }
});


module.exports = findTask = async () => {
    const currentDate = new Date();
    const dateOnly = currentDate.toISOString().split("T")[0];
    const currentHour = currentDate.getHours().toString().padStart(2, '0'); // Get the hour component
    const currentMinute = currentDate.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;

    // Query tasks with reminder date and time matching the current date and time
    const matchingTasks = await Task.find({
        date: dateOnly, // Assuming date is in YYYY-MM-DD f
        time: currentTimeString, // Assuming time is in HH:MM format // Flag to check if reminder has been sent already
    });
    // console.log('hello');
    console.log(matchingTasks);
    if (matchingTasks.length > 0) {
        matchingTasks.map(async (task) => {
            await new Email(task, null).sendReminder(task.name, task.service, task.date)
        })
    }
}