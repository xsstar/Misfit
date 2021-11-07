const Training = require('../models/Training');
const User = require('../models/User');
const fs = require('fs');

exports.createTraining = async (req, res) => {
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadeImage = req.files.image;
  let uploadPath = __dirname + '/../public/uploads/' + uploadeImage.name;

  uploadeImage.mv(uploadPath, async () => {
    const training = await Training.create({
      name: req.body.name,
      description: req.body.description,
      image: '/uploads/' + uploadeImage.name,
      user: req.session.userID,
    });
    req.flash('success', `${training.name} has been created successfully`);
    res.status(201).redirect('/trainings');
  });
};

exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find().populate('user').sort('-createdAt');
    res.status(200).render('trainings', {
      trainings,
      page_name: 'trainings',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });

    req.flash('error', `Something happened!`);
    res.status(400).redirect('/trainings');
  }
};

exports.getTraining = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const training = await Training.findOne({ slug: req.params.slug }).populate(
      'user'
    );

    res.status(200).render('training', {
      training,
      page_name: 'trainings',
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.enrollTraining = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    await user.trainings.push({ _id: req.body.training_id });
    await user.save();

    res.status(200).redirect('/users/gallery');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.releaseTraining = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    await user.trainings.pull({ _id: req.body.training_id });
    await user.save();

    res.status(200).redirect('/users/gallery');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndRemove({ slug: req.params.slug });
    let deletedImage = __dirname + '/../public' + training.image;
    fs.unlinkSync(deletedImage);

    req.flash('error', `${training.name} has been removed successfully`);

    res.status(200).redirect('/users/gallery');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findOne({ slug: req.params.slug });
    training.name = req.body.name;
    training.description = req.body.description;

    training.save();

    res.status(200).redirect('/users/gallery');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
