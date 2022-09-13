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

let db;

MongoClient.connect(process.env.DB_URL, function(error, client){
    if(error) return console.log(error)

    db = client.db('todoList');

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

app.get('/list', function(req, res){
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', {posts: result});
    });
    
});

app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);

    const willbeDeleteDate = { _id:req.body._id, writer : req.user._id }

    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제완료');
        if(result){console.log(result)}
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

const {ObjectId} = require('mongodb');

app.post('/chatroom', areYouSureLogin, function(req, res){
    const willbeSave = {
        title : '채팅채팅방',
        member : [ObjectId(req.body.당한사람id), req.user._id],
        date : new Date()
      }
    
      db.collection('chatroom').insertOne(willbeSave).then(function(result){
        res.send('저장완료')
      });
    });

app.get('/chat', areYouSureLogin, function(req, res){
    db.collection('chatroom').find({ member : req.user_id}).toArray().then(()=>{
        req.render('chat.ejs', {data : result})
    })
});

app.post('/message', areYouSureLogin, function(req, res){
    const willbeSave = {
        parent : req.body.parent,
        userid : req.user._id,
        content : req.body.content,
        date : new Date(),
      }
      db.collection('message').insertOne(willbeSave)
      .then((result)=>{
      }).catch(()=>{
        res.send('DB저장성공')
      })
    }); 

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

app.post('/register', function(req, res){
    db.collection('login').insertOne({ id : req.body.id, pw : req.body.pw }, function(error, result){
        res.redirect('/')
    })
});

app.post('/add', function(req, res){
    res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
        console.log(result.totalPost)
        const totalPostCounter = result.totalPost;

        const willbeSave = { _id : totalPostCounter+ 1, writer : req.user._id, title : req.body.title, date : req.body.date }
        
        db.collection('post').insertOne( willbeSave, 
            function(error, result){
                console.log('저장완료2');
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}}, function(error, result){
                if(error){
                    return console.log(error)
                }
            });
        });
    });
});


app.get('/search', (req, res)=>{
    const searchCondition = [
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
});

app.use('/shop', require('./routes/shop.js'));
app.use('/board/sub', require('./routes/board.js'));



//mongoDB 이미지를 그대로 저장하지않는다. 용량이 너무 크고, 일반하드에 저장하는 것이 싸고 간단하기 때문에
//app.post()~ 어허! npm install multer을 설치하여 이 라이브러리를 이용하여 
//multipart/form-data데이터를 쉽게 처리할 수 있게 도와줌, 파일전송을 저장, 분석 쉽게할 수 있게 도와줌

//npm install multer 설치 후 사용법
let multer = require('multer');
const storage = multer.diskStorage({ //램에다 저장하고 싶다면 diskStorage말고 memoryStorage()로 

  destination : function(req, file, callback){
    callback(null, './public/image')
  },
  filename : function(req, file, callback){
    callback(null, file.originalname + 'date' + new Date())
  },
  filefilter : function(req, file, callback){
    const ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
});

const upload = multer({storage : storage});


app.get('/upload', function(req, res){
    res.render('upload.ejs')
});

//app.post('/upload', upload.single('input의_name속성이름'), function(req, res){
app.post('/upload', upload.single('profile'), function(req, res){
    res.send('업로드완료')
});

//파일을 여러개 업로드하고 싶을 경우
//app.post('/upload', upload.array('profile', 10 /* 받을 최대 갯수*/), function(req, res){


//업로드한 이미지 조회
app.get('/image/:imageName', function(req, res){
    res.sendFile( __dirname + '/public/image' + req.params.imageName)
});