const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'

    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'guide', 'lead-guide', 'admin']

    },
    password: {
        type: String,
        required: [true, 'A user must enterd the password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please Confirm Your Password'],
        // from validation function we return true or false if the return value is false than we get validation error
        // this on;y works on save
        validate: {
            validator: function (el) {
                return el === this.password;
            }
        },
        message: "Passwords are not the same "
    },
    passwordChangedAt: Date,
    PasswordResetToken: String,
    PasswordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})
userSchema.pre('save', async function (next) {
    //only run this function if password is actually modified
    if (!this.isModified('password')) {
        return next();
    }
    //Hash the passwrod with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //de;lete the password confirm 
    this.passwordConfirm = undefined;
    next();


})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();

})
userSchema.pre(/^find/, function (next) {
    //this points to current query
    //before any find query executes this middle will run

    this.find({ active: { $ne: false } });
    next();
})

//instance method --. available for all the docs of a collection 
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {

    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTtimestamp < changedTimestamp;
    }
    //false means not changed 
    return false
}
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); //donot store plain reset token in database just like password

    this.PasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex') //encrypted is stroe in database
    this.PasswordResetExpire = Date.now() + 10 * 60 * 1000; //expiration time of token 

    console.log(resetToken);
    console.log(
        this.PasswordResetToken);

    return resetToken // we will send this via email
}
const User = mongoose.model('User', userSchema);
module.exports = User;