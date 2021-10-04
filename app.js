const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const bycrypt = require('bcryptjs');
const {ensureAuthenticated,  forwardAuthenticated} = require('./config/auth');

const Article = require('./models/article');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const articleroute = require('./routes/articles');

const flash = require('connect-flash');
const session = require('express-session');
const methodover = require('method-override');
require('dotenv/config');

require('./config/passport')(passport);

//Bodyparser Middleware
app.use(bodyParser.json());

//View Engine
app.use(expressLayouts);

app.set('view engine', 'ejs');


//ImportRoutes
//const postsRoute = require('./routes/posts');
//app.use('/posts', postsRoute);

app.use(express.urlencoded({extended: false}));
app.use(methodover('_method'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

//passport middleware
app.use(passport.initialize())
app.use(passport.session());


//Global Vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  
app.use(express.static('public'));


//Routes
//app.use('/', require('./routes/index'));
app.get('/',forwardAuthenticated, (req,res) => res.render('login1'));

app.use('/users', require('./routes/users'));
 
//Routes
app.get('/dashboard',ensureAuthenticated,async (req,res) =>{
    const article = await Article.find().sort({
        createdAt : 'desc'
    });
    res.render('articles/index',{articles: article, name: req.user.name});
});



//Connect to Db
mongoose.connect(process.env.DB_CONNECTION, 
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(()=> console.log('Connected to Database'))
    .catch(err => console.log(err));


//Routers
app.use('/articles', articleroute);
// app.use('/login',loginRoute);
// app.use('/register',registerRoute);



app.post('/', (req,res,next)=>{
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect:'/',
        failureFlash: true

    })(req,res,next);
})


//Start Listening
const PORT = process.env.PORT || 3000;

app.listen(PORT,console.log(`Server started at port ${PORT}`));