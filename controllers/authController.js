const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Training = require('../models/Training');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    req.flash(
      'success',
      `${user.name} user has been created successfully! You Can Login..`
    );
    res.status(201).redirect('/login');
  } catch (error) {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array()[0].msg);

    for (let i = 0; i < errors.array().length; i++) {
      req.flash('error', `${errors.array()[i].msg}`);
    }

    res.status(400).redirect('/register');
  }
};

exports.loginUser =  (req, res) => {
  try {
    const { email, password } = req.body;

     User.findOne({ email }, (err, user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            // USER SESSION
            req.session.userID = user._id;
            res.status(200).redirect('/users/gallery');
          } else {
            req.flash('error', 'Your password is not correct!');
            res.status(400).redirect('/login');
          }
        });
      } else {
        req.flash('error', 'User is not exist!');
        res.status(400).redirect('/login');
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getGalleryPage = async (req, res) => {
  const user = await User.findOne({ _id: req.session.userID }).populate(
    'trainings'
  );
  const users = await User.find();
  const trainings = await Training.find({ user: req.session.userID });
  res.status(200).render('gallery', {
    page_name: 'gallery',
    user,
    trainings,
    users,
  });
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    await Training.deleteMany({ user: req.params.id });
    res.status(200).redirect('/users/gallery');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
