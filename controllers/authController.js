const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email')
const AppError = require('./../utils/appError')
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

}
const createSendToken = (user, StatusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true // we can not manipulate cookie in the browser
    }
    if (process.env.NODE_ENV === 'production') { cookieOptions.secure = true; }
    user.password = undefined;
    res.cookie('jwt', token, cookieOptions)
    res.status(StatusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
        photo: req.body.photo
    })
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome()
    createSendToken(newUser, 201, res)
});
exports.login = catchAsync(async (req, res, next) => {
    // const email=req.body.email; do with obj destructring
    const { email, password } = req.body

    //check email and password already exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // check if user exists &7 pass in correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }
    // if eveything ok ,send token to client 

    createSendToken(user, 200, res);

});

exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
}


exports.protect = catchAsync(async (req, res, next) => {
    // 1 getting token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError('You are not logged in,please login to get access', 401));
    }
    //2 verification of token jwt
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded);

    //3 check if user still exists or check if user still exists in db  
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('The token belonging to user no longer exist', 401))
    }



    //4 check if user changed pass after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401))
    }
    // grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser
    next();
});

//only for renderd pages
exports.isLoggedIn = async (req, res, next) => {
    // 1 getting token and check if it exists

    if (req.cookies.jwt) {
        try {
            //2 verification of token jwt
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            // console.log(decoded);

            //3 check if user still exists or check if user still exists in db  
            const currentUser = await User.findById(decoded.id)
            if (!currentUser) {
                return next()
            }

            //4 check if user changed pass after jwt was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next()
            }
            // There is a logged in user
            res.locals.user = currentUser
            return next();
        }
        catch (err) {
            return next();
        }
    }
    next();
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin','lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you do not have permission top perform this action', 403))
        }
        next()
    }
}
exports.forgetPassword = catchAsync(async (req, res, next) => {
    //get user based on the posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('Thre is no user with that email address', 404));
    }
    //2generate the random token
    const resetToken = user.createPasswordResetToken();
    //now in the function we are only modifying the database by adding resettoken and expiration time we need to save it
    await user.save({ validateBeforeSave: false });
    //if we use normal save user.save() it will throw error as we are not providing required fields

    //3send it back as an email


    try {
        // await Email({
        //     email: user.email,
        //     subject: 'Your password reset token valid for 10 min',
        //     message

        // });
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken} `
        await new Email(user, resetURL).sendPasswordReset()

        res.status(200).json({
            status: "success",
            message: "token sent to email"
        })
    }
    catch (err) {

        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was error sending the email', 500))
    }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
    //1 ) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ PasswordResetToken: hashedToken, PasswordResetExpire: { $gt: Date.now() } })
    // 2) set the password if token has not expired and there is user
    // console.log(hashedToken);
    // console.log(user)
    if (!user) {
        return next(new AppError('Token is invalid ', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpire = undefined;

    await user.save();
    //3) Update changedPasswordAt property of the user

    //4) log the user in

    const token = signToken(user._id)
    createSendToken(token, 200, res)
})
exports.updatePassword = async (req, res, next) => {
    //1) get user from collection
    const user = await User.findById(req.user.id).select('+password')

    //2) posted pass is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is incorrect", 401))
    }

    //3) if so,update the pass
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) log user in
    const token = signToken(user._id)
    createSendToken(token, 200, res)
}