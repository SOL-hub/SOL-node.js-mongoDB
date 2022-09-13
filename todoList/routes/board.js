let router = require('express').Router();

app.get('/sports', function(req, res){
    res.send('스포츠 게시판');
 });
 
 app.get('/game', function(req, res){
    res.send('게임 게시판');
 }); 