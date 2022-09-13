const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');
app.use('/public', express.static('public'))

require('dotenv').config()

var db;

MongoClient.connect(process.env.DB_URL, function(error, client){
    if(error) return console.log(error)

    db = client.db('todoList');
    // db.collection('post').insertOne( {name : 'park', _id : 100}, function(error, result){
    //     console.log('저장완료');});

    app.listen(process.env.PORT, function(){
        console.log('test 8080');
    });
});

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    res.render('write.ejs');
});

app.post('/add', function(req, res){
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
        console.log(result.totalPost)
        var totalPostCounter = result.totalPost;
        
        db.collection('post').insertOne({ _id : totalPostCounter+ 1, title : req.body.title, date : req.body.date }, function(error, result){
            console.log('저장완료2');
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}}, function(error, result){
                if(error){
                    return console.log(error)
                }
            });
        });
    });
});


app.get('/list', function(req, res){
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', {posts: result});
    });
    
});

app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제완료');
        res.status(200).send({message : '성공했습니다.'});
    });
});

app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(error, result){
        console.log(result);
        res.render('detail.ejs', {data : result});
    })
});


app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        console.log(result)
        res.render('edit.ejs', {post : result})
    })
});

app.put('/edit', function(req, res){
    db.collection('post').updateOne({ _id: parseInt(req.body.id)}, 
    { $set : {title : req.body.title, date : req.body.date}}, function(error, result){
        console.log("결과완료");
        res.render('/list')
    })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { response } = require('express');

//미들웨어 설정
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(req, res){
    res.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
    failureRedirect:'/fail'
}), function(req, res){
    res.redirect('/')
});

app.get('/mypage', areYouSureLogin, function(req, res){
    console.log(req.user)
    res.render('mypage.ejs', {user : req.user})
});

function areYouSureLogin(req, res, next){
    if(req.user){
        next()
    } else{
        res.send('로그인안하셨어요')
    }

}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (inputValueId, inputValuePw, done) {
    db.collection('login').findOne({ id: inputValueId }, function (error, result) {
      if (error) return done(error)
  
      if (!result) return done(null, false, { message: '존재하는 아이디확인완료' })
      if (inputValuePw == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비밀번호 틀렸거든요?' })
      }
    })
  }));

  passport.serializeUser(function(user, done){ 
    done(null, user.id)
  });

  passport.deserializeUser(function(id, done){
    db.collection('login').findOne({id: id}, function(error, result){
        done(null, result)
    })
  });

app.get('/search', (req, res)=>{
    var searchCondition = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: req.query.value,
              path: 'title'
            }
          }
        },
        { $project : { title : 1, _id:0, score: { $meta: "searchScore"}}}
      ] 
    console.log(req.query.value);
        db.collection('post').find( { $text : { $search: req.query.value }} ).toArray((error, result)=>{
        console.log(result)
        res.render('search.ejs', {posts : result})
    })
})
