const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Register = require('../models/providerModel')
const Email = require('../utils/email')

exports.register = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newRegister = await Register.create({
        name: req.body.name,
        email: req.body.email,
        service: req.body.service,
        location: req.body.location,
        phone: req.body.phone
    });
    await newRegister.save()
    alert('registeration succesfull')
});