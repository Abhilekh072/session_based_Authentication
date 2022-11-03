const express = require('express');
const app = express();
const port = 5000;
const session = require('express-session');
const bodyParser = require('body-parser');
const users = [
    {id : 1,name:'Ayush' ,email:'ayush@gmail.com', password:'123'},
    {id : 2,name:'Mohendra' ,email:'mohendra@gmail.com', password:'123'},
    {id : 3,name:'Vidya' ,email:'vidya@gmail.com', password:'123'},
]

app.use(bodyParser.urlencoded({
    extended : true
}
))

app.use(session({
    name : 'sid',
    resave : false,
    saveUninitialized : false,
    secret : 'Abhilekh',
    cookie:{
        maxAge : 1000 * 10, //1 hour
        sameSite : true, //strict
        secure : false,

    }
}))

const redirectLogin = (req, res, next)=>{
    if (!req.session.userId){
        res.redirect('/login')
    }
    else{
        next();
    }
}

const redirectHome = (req, res, next)=>{
    if (req.session.userId){
        console.log('home')
        res.redirect('/home');
        res.end();
    }
    else{
        console.log('not home')
        next();
    }
}

app.use((req, res, next)=>{
    const {userId} = req.session;
    if (userId){
        res.locals.user = users.find(user=>user.id == userId);
    }
    next();
})
app.get('/', (req, res)=>{
    const {userId} = req.session;
    // const user = users.find(user=> user.id === userId)
    console.log(req.session);
    res.send(`
    <html>
        <h1>Welcome</h1>
        ${userId ? `<a href="/home">Home</a>
        <form method='post' action='/logout'>
            <button>Logout</button>
        </form>`:`<a href="/login">Login</a>
        <a href="/register">Register</a>`}
    </html>    
    `)
})

app.get('/home', redirectLogin ,(req, res)=>{
    const {user} = res.locals 
    res.send(`
    <html> 
        <h1>Home Page</h1>
        <ul>
            <li>Name: ${user.name}</li>
            <li>Email:${user.email}</li>
        </ul>
        <a href='/'>Go To Main Page</a>
    </html>
    `)
})

app.get('/login', redirectHome ,(req, res)=>{
    res.send(`
    <html>
        <h1>Login Page</h1>
        <form method='post' action='/login'>
            <input type='email' placeholder='email' name='email'>
            <input type='password' placeholder='password' name='password'>
            <input type='submit' value='Login'>
        </form> 
        <a href='/'>Go To Main Page</a>
        <a href='/register'>Register</a>

    </html>
    `)

})
app.get('/register', redirectHome ,(req, res)=>{
    res.send(`
    <html>
        <h1>Register Page</h1>
        <form method='post' action='/register'>
            <input placeholder='Name' name='name'>
            <input type='email' placeholder='email' name='email'>
            <input type='password' placeholder='password' name='password'>
            <input type='submit' value='Register'>
        </form> 
        <a href='/'>Go To Main Page</a>
        <a href='/login'>Login</a>
    </html>
    `)
})

app.post('/login', redirectHome ,(req, res)=>{
    const { email, password} = req.body;
    console.log(req.body);
    console.log(email + ' ' + password + ' Abhilekh')
    if (email && password){
        const user = users.find( user=> user.email == email && user.password == password)
        if (user){
            console.log(email + ' ' + password + ' Abhilekh')
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }
        res.redirect('/login');
})
app.post('/register', redirectHome ,(req, res)=>{
    const {name , email, password} = req.body;
    console.log(req.body);
    if (name && email && password){
        const exist = users.some(user => user.email == email);
        if (!exist){
            users.push({
                id : users.length + 1,
                name,
                email,
                password
            })
            res.send(`You Are Registered`)
            res.redirect('/login');
        }

    }
    else{
        res.redirect('/register');
    }
})

app.post('/logout', redirectLogin ,(req, res)=>{
    req.session.destroy(err=>{
        if (err) return res.redirect('/home');
    })

    res.clearCookie('sid');
    res.redirect('/login');
})

app.listen(port, ()=>{
    console.log(`http://localhost:${port}`);
});