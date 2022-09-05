const express = require('express'); //설치한 라이브러리를 설치해줘~
const app = express(); //첨부한 라이브러리를 이용하여 새로운 객체를 만듬

app.listen(8080, function(){
    console.log('test 8080')
});//서버어디다 열지 괄호안에 적어주기

//서버를 띄우기 위한 기본 문법(서버 오픈하는 문법)

app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});