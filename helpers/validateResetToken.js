const crypto = require("crypto");
const UserModel = require("../models/User");

const validateResetToken = async (token) => {
    const hashtedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await UserModel.findOne({
        resetPasswordToken: hashtedToken,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    });
    return await user;
}

module.exports = validateResetToken;