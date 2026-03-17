const { logger } = require("../../utils/logging.js");
const { validateUser, validateLogin, validateUserUpdate, validateOtpRequest } = require("./validation.js");
const userService = require("./service.js");
const AppError = require("../../utils/AppError.js");
const userLogger = logger.child({ module: "userController" })
const jwt = require("jsonwebtoken")
require("dotenv").config()

const fs = require("fs");
const { Session } = require("../../model/Session.js");
const { generateAccessToken } = require("../../utils/token.js");
const path = require("path");
const { apiResponse } = require("../../config/responseHandler.js");
const { User } = require("../../model/User.js");
const { promises } = require("dns");

module.exports.sendSignupOTP = async (req, res) => {
    try {
        const parsedData = req.body;
        await validateOtpRequest(parsedData);

        const result = await userService.sendSignupOTP(parsedData);

        return apiResponse({
            res,
            code: 200,
            message: "OTP sent to your email",
            status: true,
            data: result
        })
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}

module.exports.verifySignupOTP = async (req, res) => {
    try {
        const parsedData = JSON.parse(req.body.data)
        const { otp } = req.body

        if (!otp) {
            throw new AppError("OTP is required", 400)
        }

        await validateUser(parsedData);

        const user = await userService.verifySignupOTP(parsedData, req.file, otp)

        return apiResponse({
            res,
            code: 201,
            message: "User created successfully",
            status: true,
            data: user
        })
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path)
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.loginUser = async (req, res) => {
    try {

        await validateLogin(req.body)

        const data = await userService.loginUser(req)

        return apiResponse({
            res,
            code: 200,
            message: "User Login succesfully",
            status: true,
            data: data
        })

    } catch (err) {
        userLogger.error(err.message, { function: "loginUser" })
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.logoutUser = async (req, res) => {
    try {

        // delete the session of the user
        console.log(req.user._id)
        const s = await Session.updateMany({ userId: req.user._id }, { isValid: false })
        // console.log(s)

        return apiResponse({
            res,
            code: 200,
            message: "User Logout successfully",
            status: true,
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}


module.exports.updateUser = async (req, res) => {
    try {
        const parsedData = JSON.parse(req.body.data)

        await validateUserUpdate(parsedData)
        const user = await userService.updateUser(parsedData, req.file, req.user)

        return apiResponse({
            res,
            code: 200,
            message: "User updated successfully",
            status: true,
            data: user
        })


    } catch (err) {
        try {
            fs.unlinkSync(req.file.path)
        } catch (err) {
            console.log("file still exists in the  directory")
        }
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}


module.exports.getUserById = async (req, res) => {
    console.log("--------------------------------------")
    try {
        const user = await userService.getUserById(req.params.userId)
        return apiResponse({
            res,
            code: 200,
            message: "User fetched successfully",
            status: true,
            data: user
        })
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}



module.exports.refresh = async (req, res) => {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) throw new AppError("refresh token required", 400)

        const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
        console.log(payload)

        const session = await Session.findOne({ userId: payload.userId, isValid: true })

        if (!session) throw new AppError("Your session has expired , Login again", 401)

        //lets check is the user still exists or has deleted account
        const user = await User.findById(payload.userId)
        if (!user) throw new AppError("User not longer exists , account deleted")

        const accessToken = await generateAccessToken(payload.userId)

        return apiResponse({
            res,
            code: 201,
            message: "Access token generated",
            status: true,
            data: { accessToken: accessToken }
        })

    } catch (err) {
        console.log(err)
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false
        })
    }
}


module.exports.saveFcmToken = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(userId, { fcmToken })

        return apiResponse({
            res,
            code: 200,
            message: "Fcm token saved successfully",
            status: true,
        })

    } catch (err) {
        console.log(err.message)
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await userService.forgotPassword(email);
        return apiResponse({
            res,
            code: 200,
            message: "OTP sent to your email",
            status: true,
        })
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}

module.exports.verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;
        const data = await userService.verifyOtp(otp, email);
        return apiResponse({
            res,
            code: 200,
            message: "OTP verified successfully",
            status: true,
            data: data
        })
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const data = await userService.changePassword(token, newPassword);
        return apiResponse({
            res,
            code: 200,
            message: "Password changed successfully",
            status: true,
            data: data
        })
    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}


module.exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query
        if (!q || q.trim().length === 0) {
            return apiResponse({ res, code: 200, message: "Search results", status: true, data: [] })
        }

        const regex = new RegExp(q.trim(), "i")
        const users = await User.find({
            $or: [
                { fullName: regex },
                { userName: regex }
            ],
            _id: { $ne: req.user._id } // exclude self from results
        })
            .select("_id fullName userName avatar role")
            .limit(10)

        return apiResponse({
            res,
            code: 200,
            message: "Search results",
            status: true,
            data: users
        })

    } catch (err) {
        return apiResponse({
            res,
            code: err.statusCode || 500,
            message: err.message,
            status: false,
        })
    }
}