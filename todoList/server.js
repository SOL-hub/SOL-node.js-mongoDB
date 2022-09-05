const express = require('express'); //설치한 라이브러리를 설치해줘~
const app = express(); //첨부한 라이브러리를 이용하여 새로운 객체를 만듬
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.listen(8080, function(){
    console.log('test 8080')
});//서버어디다 열지 괄호안에 적어주기

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