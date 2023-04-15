const express = require('express');
const session = require('express-session')
const redis = require('redis');
const RedisStore = require('connect-redis');
const bodyParser = require('body-parser')
var client  = redis.createClient();
const path = require('path')
const app = express();
const port = 3000;

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
  });

//   // Initialize store.
// let redisStore = new RedisStore({
//     client: redisClient,
//     prefix: "myapp:",
//   })


app.use(session({
    // store: new RedisStore({ client: redisClient }),
   // store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    secret: 'Keep it secret',
    name: 'uniqueSessionID',
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}))
app.get('/', (req, res) => {
    if (req.session.loggedIn)
        res.redirect('/dashboard')
    else
        res.sendFile('home.html', {
            root: path.join(__dirname, 'public')
        })
})
app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn) {
        res.setHeader('Content-Type', 'text/html')
        res.write('Welcome ' + req.session.username + ' to your dashboard')
        res.write('<a href="/logout">Logout</a>')
        res.end()
    } else
        res.redirect('/login')
})
app.get('/login', (req, res) => {
    res.sendFile('login.html', {
        root: path.join(__dirname, 'public')
    })
})
app.post('/authenticate', bodyParser.urlencoded(), (req, res, next) => {
    // Actual implementation would check values in a database
    if (req.body.username == 'foo' && req.body.password == 'bar') {
        res.locals.username = req.body.username
        next()
    } else
        res.sendStatus(401)
}, (req, res) => {
    req.session.loggedIn = true
    req.session.username = res.locals.username
    console.log(req.session)
    res.redirect('/dashboard')
})
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {})
    res.send('Thank you! Visit again')
})
app.listen(port, () => {
    console.log('Website is running')
});