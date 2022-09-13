const express = require('express'); //설치한 라이브러리를 설치해줘~
const app = express(); //첨부한 라이브러리를 이용하여 새로운 객체를 만듬

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');//설치한 EJS를 쓰겠다는 선언
app.use('/public', express.static('public'))

//어떤 데이터베이스에다 저장했나 명시해야함
var db;

MongoClient.connect('mongodb+srv://admin:qwe123@cluster0.kseihoi.mongodb.net/todoList?retryWrites=true&w=majority', function(error, client){
    //연결되면       mongodb+srv://admin:qwe123@cluster0.kseihoi.mongodb.net/todoapp?retryWrites=true&w=majority
    if(error) return console.log(error)

    db = client.db('todoList'); //todoList라는 database(폴더)에 연결행

    // db.collection('post').insertOne('저장할 데이터', function(error, result){
        db.collection('post').insertOne( {name : 'park', _id : 100}, function(error, result){
        console.log('저장완료');
    });//내가 원하는데이터 저장

    app.listen(8080, function(){
        console.log('test 8080');
    });
});


//서버를 띄우기 위한 기본 문법(서버 오픈하는 문법)

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