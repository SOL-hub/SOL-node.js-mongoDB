const express = require('express'); //설치한 라이브러리를 설치해줘~
const app = express(); //첨부한 라이브러리를 이용하여 새로운 객체를 만듬

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;

//어떤 데이터베이스에다 저장했나 명시해야함
var db;

MongoClient.connect('mongodb+srv://admin:qwe123@cluster0.kseihoi.mongodb.net/todoapp?retryWrites=true&w=majority', function(error, client){
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
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html')
});

app.post('/add', function(req, res){
    res.send('전송완료');
    console.log(req.body.title);
    console.log(req.body.date);
});