const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../modules/SendEmail');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '10d' });
};

const registerUser = async (req, res) => {
  const { fullName, email, mobileNo, office, password, role } = req.body;

  try {
    const ifEmailExists = await User.findOne({ email });
    if (ifEmailExists){
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    const ifMobileExists = await User.findOne({ mobileNo });
    if (ifMobileExists){
      return res.status(400).json({
        message: 'User already exists with this mobile number'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = Date.now() + 2 * 60 * 1000;

    const user = await User.create({
      fullName,
      email,
      mobileNo,
      office,
      role: role,
      password: hashedPassword,
      otp,
      otpExpires,
      verifiedOTP: false
    });

    await sendEmail(
      email,
      'Verify your email',
      `Your OTP is ${otp}. Valid for 2 minutes.`
    );

    res.status(201).json({
      message: "User registered. OTP sent to email.",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const verifyOTP = async(req, res) => {
  const { email, otp } = req.body;

  try{
    const user = await User.findOne({ email });
    if (!user){
      return res.status(404).json({
        message: "User not found"
      });
    }

    if(user.otp !== otp){
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if(user.otpExpires < Date.now()){
      return res.status(400).json({
        message: "OTP expired" 
      });
    }

    user.verifiedOTP = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const login = async(req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user){
      return res.status(401).json({
        message: "User not found"
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword){
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    if (!user.verifiedOTP){
      return res.status(403).json({
        message: "Email not verified"
      });
    }

    const token = generateToken(user._id);
    console.log('Generated token:', token);

    res.status(200).json({
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({
        message: "User not found"
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 2 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP is ${otp}. Valid for 2 minutes.`
    );

    res.status(200).json({
      message: "OTP sent to email" 
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  const { email , otp, newPassword } = req.body;

  try{
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found" 
      });
    }

    if(user.otp !== otp){
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if(user.otpExpires < Date.now()){
      return res.status(400).json({
        message: "OTP expired" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    res.status(200).json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

module.exports = { registerUser, verifyOTP, login, forgetPassword, resetPassword, getAllUsers, deleteUser };