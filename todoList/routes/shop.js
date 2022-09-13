var router = require('express').Router();

function areYouSureLogin(req, res, next){
    if(req.user){
        next()
    } else{
        res.send('로그인안하셨어요')
    }
}

router.use(areYouSureLogin);
//router.use('/shirts', areYouSureLogin);


router.get('/shirts', function(req, res){
    res.send('셔츠 파는 페이지');
});


router.get('/pants', function(req, res){
    res.send('스커트 파는 페이지');
}); 

module.exports = router;