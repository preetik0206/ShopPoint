const crypto = require("crypto");
const createError = require("../utilis/createError");
const asyncHandler = require("../middleware/async");
const verifyEmail = require("../utilis/verifyEmail");
const sendEmail = require("../utilis/sendEmail");
const cron = require("node-cron");
const User = require("../models/User");

const RegisterUser = asyncHandler(async (req, res, next) => {
  try {
    const email = req.body.email

    const checkEmailExists = await User.findOne({
      email,
    })

    if(checkEmailExists){
      throw new Error("Email already exists");
    }
    const newUser = await User.create({ ...req.body});
    
    res.status(200).send({
      status: "success",
      data : newUser,
      message: "Account created successfully",
    });
  } catch (error) {
    throw createError(500, error.message);
  }

  // sendTokenResponse(newUser, 200, res);
});

const login = asyncHandler(async (req, res, next) => {
  console.log('34 :>> ', 34);
  console.log('test')
  const user = await User.findOne({
    email: req.body.email,
  }).select("+password");
  if (!user) throw createError(401, `Email doesn't match`);

  const isPassword = await user.matchPassword(req.body.password);
  if (!isPassword) throw createError(401, `Password doesn't match`);

  sendTokenResponse(user, 200, res);
});

//Update user details

const updateDetails = asyncHandler(async (req, res, next) => {
  const newDetails = {
    name: req.body.name,
    email: req.body.email,
  };

  const editDetails = await User.findByIdAndUpdate(req.user._id, newDetails, {
    new: true,
    runValidators: true,
  });

  const updateDetails = await User.findById(req.user._id);
  res.status(200).send({ status: "success", data: updateDetails });
});

//Update Password

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  //compare currentPassword

  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch)
    throw createError(
      400,
      `Current password ${req.body.currentPassword} does't match`
    );

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

//Forgot Password

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw createError(400, `User with email ${req.body.email} is not found`);

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `https://shoppoint.herokuapp.com/reset-password/?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else ) has
    requested the reset of a password.`;

    const options = {
      email: user.email,
      subject: "Password reset token",
      message,
      url: resetUrl,
    };

    await sendEmail(options);

    res
      .status(200)
      .send({ status: "success", message: "ResetPassword token Email sent" });
  } catch (error) {
    console.log(error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw createError(500, "Email cound't be sent");
  }
});

//ResetPassword

const resetPassword = asyncHandler(async (req, res, next) => {
  //Hash the resetToken

  const resetToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw createError(400, `Invalid token ${req.body.token}`);

  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .send({ status: "success", message: "Your Password has beed changed" });
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.genAuthToken();

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    verify: user.verify,
  };

  res.status(statusCode).send({ status: "success", token, authData: userData });
};

module.exports = {
  RegisterUser,
  login,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verificationEmail,
};
