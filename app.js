const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const pageRoute = require('./routes/pageRoute');
const trainingRoute = require('./routes/trainingRoute');
const userRoute = require('./routes/userRoute');

const app = express();

//Connect DB
mongoose
  .connect('mongodb+srv://dbUser:AaA2iDCvUZ6MRRvI@cluster0.fwr5d.mongodb.net/misfit-db?retryWrites=true&w=majority')
  
  .then(() => {

    console.log('DB Connected Successfully');
  })
  .catch((err) => {
    console.log(err);
  });

//Template Engine
app.set('view engine', 'ejs');

//Global Variable
global.userIN = null;

//Middlewares
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(
  session({
    secret: 'my_keyboard_cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://dbUser:AaA2iDCvUZ6MRRvI@cluster0.fwr5d.mongodb.net/misfit-db?retryWrites=true&w=majority' }),
  })
);
app.use(fileUpload());
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});
app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);

//Routes
app.use('*', (req, res, next) => {
  userIN = req.session.userID;
  next();
});

app.use('/', pageRoute);
app.use('/trainings', trainingRoute);
app.use('/users', userRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App started on port ${port} `);
});
