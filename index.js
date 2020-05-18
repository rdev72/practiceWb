const express = require('express')
const port = 3000
const bodyParser = require('body-parser')
const mongoose = require ('mongoose')
const userSchema= require('./models/userSchema')
const session = require('express-session')
const articleSchema= require('./models/articleSchema')
// MiddleWare

//For Express  
const app = express()
//For TempletEngine
app.set('view engine','ejs'); // Keep all files in views directory

//For Body Parser
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// For Mongoose
mongoose.connect('mongodb://localhost:27017/nodekb',{
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db =mongoose.connection;
db.once('open',()=>console.log('mongo connected'));
db.on('error',err=> console.log(err));

//For Express-Session

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
//   cookie: { secure: true }
}))

// Code Start from Here
app.get('/',(req,res)=>{ 
    articleSchema.find().populate('auther','name -_id').exec()
    .then(articles=>res.render('index',{tittle:'Root', data:articles ,user:req.session.user}))
    .catch(err=>console.log(err)) 
}
);
app.get('/about',(req,res)=>res.send('hello about'));

app.listen(port,()=>console.log(`server is running at ${port}`));

app.post('/auth/register',(req,res)=>{
    // console.log(req.body);

    if(req.body.password == req.body.cpassword) {
        userSchema.create({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
        })
        .catch(err=>console.log(err))
        res.redirect('/');

    }else{
        res.send(`<script>alert('Password did not match')</script>`)
    } 
});
  
app.post('/auth/login',(req,res)=>{
    userSchema.findOne({email:req.body.email}) .exec() .then(user=>{   //find the collection ,whose key(email ->req.body.email is matching )and store all that data in key(User)
    if(user){
        if(user.password==req.body.password){
            // req.session.loggedIn= true ;
            req.session.user = user;
            res.redirect('/console');

        }else{res.send(`<script>alert('Incorrect Password')</script>`)}

    }else{
        res.send(`<script>alert('User not found')</script>`)}

    
    }).catch(err=> console.log(err))
})

app.get('/console',(req,res)=>{
    if(req.session.user){
        articleSchema.find({auther:req.session.user._id }).exec().then(userArticle=>{
            // console.log(userArticle)
            res.render('console', {user:req.session.user, userArticle:userArticle})
        }).catch()
    
    }else{
        res.redirect('/') 
    }
});
app.get('/logout',(req,res)=>{
    req.session.destroy(err=> {
        if (err)
        {
        console.log(err)}
    });
    res.redirect('/');

});
app.post('/article/add', (req,res)=>{
    if(req.session.user){
    articleSchema.create({
        title:req.body.tittle,
        auther:req.session.user._id,
        description:req.body.description

    }).then(article=>{
        // console.log(article),
        res.redirect('/console')
    }).catch(err=>{
        console.log(err)
    })}
    else{res.redirect('/')}
})

app.get('/article/edit/:aid',(req,res)=>{  //way to write dynamic entry in server
    if(req.session.user){
        articleSchema.findById(req.params.aid).exec()
        .then(article=>{
            if(article && article.auther== req.session.user._id){
                
                res.render('editArticle',{user:req.session.user,article:article})
    
            }else{
                res.render('editArticle',{msg:('Article not found or U not elgbl to edit')})
            }
        }).catch(err=>console.log(err))

    }else{
        res.redirect('/')
    }
   
    
})
app.get('/article/edit/:aid',(req,res)=>{
    let toUpdate = {};
    req.body.tittle ? toUpdate[title] = req.body.title :'';
    req.body.description ? toUpdate[description]= req.body.description :'';
    articleSchema.findByIdAndUpdate(req.params.aid,{$set:toUpdate}).exec().then(article=> res.redirect('/console')).catch(err => console.log(err))
}
