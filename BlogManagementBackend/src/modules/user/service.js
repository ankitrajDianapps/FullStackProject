const { User } = require("../../model/User.js")
const { OTP } = require("../../model/OTP.js")
const emailService = require("../../utils/emailService.js")
const jwt = require("jsonwebtoken")
const { logger } = require("../../utils/logging.js")
const bcrypt = require("bcryptjs")
const AppError = require("../../utils/AppError.js")
const { generateAccessToken, generateRefreshToken } = require("../../utils/token.js")
const { Session } = require("../../model/Session.js")
const fs = require("fs")
const path = require("path")

const uaParser = require("ua-parser-js")
const { uploadAvatar } = require("../../utils/Upload.js")
const { default: mongoose } = require("mongoose")
const { messages } = require("../../messages/apiResponses.js")
const { clearCache } = require("../../middleware/cacheMiddleware.js")


const serviceLogger = logger.child({ module: "userService " })

// Send OTP for signup verification
const sendSignupOTP = async (data, file) => {
    try {
        // Check if user with same email or username already exists
        const isUserNameExists = await User.findOne({ userName: data.userName })
        if (isUserNameExists) {
            throw new AppError("userName already exists", 409)
        }

        const isEmailExists = await User.findOne({ email: data.email })
        if (isEmailExists) {
            throw new AppError("email already exists", 409)
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Send OTP email
        await emailService.sendSignupOTPEmail(data.email, data.fullName, otp)

        // Store OTP temporarily (we'll use email as identifier since user doesn't exist yet)
        // Delete any existing OTP for this email
        await OTP.deleteMany({ userId: data.email })

        const otpData = new OTP({
            userId: data.email, // Temporarily store email as userId
            otp: otp,
            isVerified: false,
            expireAt: new Date(Date.now() + 5 * 60 * 1000)
        })

        await otpData.save()

        return { message: "OTP sent to email" }
    } catch (err) {
        serviceLogger.error(err.message, { function: "sendSignupOTP" })
        throw new AppError(err.message, err.statusCode || 500)
    }
}

// Verify signup OTP and create user
const verifySignupOTP = async (data, file, otp) => {
    try {
        // Find OTP document by email
        const otpDoc = await OTP.findOne({ userId: data.email })
        if (!otpDoc) {
            throw new AppError("OTP expired or not found", 400)
        }

        // Verify OTP
        if (otpDoc.otp !== otp) {
            throw new AppError("Invalid OTP", 400)
        }

        if (otpDoc.isVerified) {
            throw new AppError("OTP already used", 400)
        }

        // Check again if user exists (in case created between OTP send and verify)
        const isUserNameExists = await User.findOne({ userName: data.userName })
        if (isUserNameExists) {
            throw new AppError("userName already exists", 409)
        }

        const isEmailExists = await User.findOne({ email: data.email })
        if (isEmailExists) {
            throw new AppError("email already exists", 409)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Create user
        const registeredUser = await User.create({
            userName: data.userName,
            email: data.email,
            role: data.role,
            password: hashedPassword,
            bio: data.bio,
            fullName: data.fullName,
            isActive: data.isActive,
            avatar: file?.filename
        })

        // Delete OTP after successful registration
        await OTP.deleteOne({ _id: otpDoc._id })

        const { password, ...safeUser } = registeredUser.toObject()
        return safeUser
    } catch (err) {
        serviceLogger.error(err.message, { function: "verifySignupOTP" })
        throw new AppError(err.message, err.statusCode || 500)
    }
}

// verifySignupOTP handles final user registration

const loginUser = async (req) => {
    try {
        const data = req.body;

        //first check if a user with this email  exist or not
        const user = await User.findOne({ email: data.email }).select("+password")
        if (!user) throw new AppError("User with this email not registered", 401)

        //if user exists then determine the password and match it

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) throw new AppError("wrong password", 401)

        // now user has entered credentials
        // now we create access token

        const accessToken = await generateAccessToken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        console.log(accessToken)
        // console.log(refreshToken)

        //hash the refreshToken before saving it to the DB
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

        // as we are implementing only single device login , so first letss invalidate if any session of this user already exist

        await Session.updateMany(
            { userId: user._id },
            { isValid: false }
        )

        // now create a session for this user
        //we get the detail for the device in the headers in user-agents

        const ua = uaParser(req.headers["user-agent"])
        const Device = JSON.stringify(ua, null, " ")

        await Session.create(
            {
                userId: user._id,
                refreshToken: hashedRefreshToken,
                deviceType: Device.os,
                deviceModel: Device.device,
                IpAddress: req.ip
            }
        )


        //after successfull login update the user table by adding field user.loginAt as current date

        const u = await user.updateOne({ $set: { lastLogin: new Date() } })

        return { token: { accessToken, refreshToken } }

    } catch (err) {
        serviceLogger.error(err.message)
        if (!err.statusCode) throw new AppError("Internal server Error", 500)
        throw new AppError(err.message, err.statusCode)
    }
}


const updateUser = async (data, file, user) => {
    try {
        //before updating the user first get the old avatar of the user and delete it from the directory

        const oldAvatar = user.avatar;
        const filePath = path.join(__dirname, "../../uploads/Avatar/" + oldAvatar)

        const updatedUser = await User.findByIdAndUpdate(
            { _id: user._id },
            {
                fullName: data.fullName,
                bio: data.bio,
                avatar: file?.filename
            },
            { new: true }
        )

        // if user has send the file to update the avatar then only we delete the old avatar image from the directory
        if (file) {
            try {
                fs.unlinkSync(filePath)
            } catch (err) {
                console.log("unable to delete old avatar from directory : " + err.message)
            }
        }

        // Invalidate caches
        clearCache(`/api/auth/${user._id}`);
        clearCache(`/api/analytics/author/${user._id}`);
        clearCache("/api/analytics/overview"); // In case avatar/username is shown there

        return updatedUser


    } catch (err) {
        serviceLogger.error(err)
        throw new AppError(err.message, err.statusCode)
    }
}

const getUserById = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError(messages.INVALID_ID_FORMAT, 400)
        const user = await User.findById(userId)
        if (!user) throw new AppError(messages.USER_NOT_FOUND, 404)
        return user
    } catch (err) {
        serviceLogger.error(err)
        throw new AppError(err.message, err.statusCode)
    }
}

const forgotPassword = async (email) => {
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            throw new AppError("User not found with this email", 400)
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await emailService.sendOTPEmail(email, user.userName, otp)

        // delete if any otp already exists for the same user
        await OTP.deleteOne({ userId: user._id })

        const otpData = new OTP({
            otp: otp,
            userId: user._id,
            isVerified: false,
            expireAt: new Date(Date.now() + 5 * 60 * 1000)
        })

        await otpData.save()

        return otp;
    } catch (err) {
        serviceLogger.error(err.message)
        throw new AppError(err.message, err.statusCode || 500)
    }
}

const verifyOtp = async (otp, email) => {
    try {
        const user = await User.findOne({ email: email })
        if (!user) throw new AppError("User not found", 400)

        const otpDoc = await OTP.findOne({ userId: user._id })
        if (!otpDoc) throw new AppError("Verification Failed or OTP Expired", 400)

        console.log(otpDoc.otp)
        console.log(otp)
        if (otpDoc.otp != otp) { throw new AppError("wrong OTP", 400) }

        if (otpDoc.isVerified) throw new AppError("Otp is already verified", 400)

        await OTP.findByIdAndUpdate(otpDoc._id, { isVerified: true })

        const token = jwt.sign({
            userId: user._id,
            type: "forgot password"
        }, process.env.OTP_SECRET, {
            expiresIn: "5m"
        })

        return { token: token }
    } catch (err) {
        serviceLogger.error(err.message)
        throw new AppError(err.message, err.statusCode || 500)
    }
}

const changePassword = async (token, newPassword) => {
    try {
        const secret = process.env.OTP_SECRET
        let payload;
        try {
            payload = jwt.verify(token, secret)
        } catch (e) {
            throw new AppError("Invalid or Expired Reset Token", 400)
        }

        if (payload.type != "forgot password") throw new AppError("Invalid Token", 401);

        const user = await User.findById(payload.userId)
        if (!user) throw new AppError("User not Exists", 400)

        const bcryptedPassword = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(user._id, { password: bcryptedPassword })

        await Session.deleteMany({ userId: user._id })
        await OTP.deleteMany({ userId: user._id })

        return { message: "Password changed successfully" }
    } catch (err) {
        serviceLogger.error(err.message)
        throw new AppError(err.message, err.statusCode || 500)
    }
}

module.exports = {
    loginUser,
    updateUser,
    getUserById,
    forgotPassword,
    verifyOtp,
    changePassword,
    sendSignupOTP,
    verifySignupOTP
}