const express = require('express'); //설치한 라이브러리를 설치해줘~
const app = express(); //첨부한 라이브러리를 이용하여 새로운 객체를 만듬

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');//설치한 EJS를 쓰겠다는 선언
app.use('/public', express.static('public'))

//환경변수 사용을 위한 라이브러리를 설치 후 등록
require('dotenv').config()

//어떤 데이터베이스에다 저장했나 명시해야함
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
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    // res.sendFile(__dirname + '/write.html')
    res.render('write.ejs');
});

app.post('/add', function(req, res){
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
        console.log(result.totalPost)
        var totalPostCounter = result.totalPost;
        
        db.collection('post').insertOne({ _id : totalPostCounter+ 1, title : req.body.title, date : req.body.date }, function(error, result){
            console.log('저장완료2');
            //counter라는 콜렉션에 있는 totalPost라는 항목도 1증가시켜야함(수정)
            //db.collection('counter').updateOne({어떤_데이터를_수정할지},{수정할_값}, function(){})
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


// app.get('/edit/:id', function(req, res){
//     db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
//         console.log(result)
//         res.render('edit.ejs', {post : result})
//     })
// });

// app.put('/edit', function(req, res){
//     db.collection('post').updateOne({ _id: parseInt(req.body.id)}, 
//     { $set : {title : req.body.title, date : req.body.date}}, function(error, result){
//         console.log("결과완료");
//         res.render('/list')
//     })
// });

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
    // console.log(inputValueId, inputValuePw);
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

