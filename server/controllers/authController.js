const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne().or([{ email }, { username }]);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with that email or username'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password exist
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password'
      });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect username or password'
      });
    }

    // Generate token
    const token = signToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};