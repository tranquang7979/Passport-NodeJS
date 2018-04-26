const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'MYKEY',
    cookie: {
        maxAge: 1000*60*5 //minutes
    }
}))
app.use(Passport.initialize());
app.use(Passport.session());

app.get('/', (req, res) => res.render('index'));
app.get('/loginSuccess', (req, res) => res.send('Login successfull'));

app.route('/login')
.get((req, res) => res.render('login'))
.post(Passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/loginSuccess'
}));

app.get('/private', (req, res) => {
    if(req.isAuthenticated())
        res.send('Welcome to system.');
    res.send('Please login first');
});

Passport.use(new LocalStrategy(
    (username, password, done) => {
        fs.readFile('./userDB.json', (err, data) => {
            const db = JSON.parse(data);
            const user = db.find(user => user.username === username);
            if(user && user.pwd === password)
                return done(null, user);
            return done(null, false);
        });
    }
));

Passport.serializeUser((user, done) => {
    done(null, user.username);
});

Passport.deserializeUser((name, done) => {
    fs.readFile('./userDB.json', (err, data) => {
        const db = JSON.parse(data);
        const user = db.find(user => user.username === name);
        if(user)
            return done(null, user);
        return done(null, false);
    });
});

const port = 3000;
app.listen(port, () => console.log(`Server is running port ${port}`));