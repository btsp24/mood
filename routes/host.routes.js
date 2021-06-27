const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../isAuth');

/* 
    hepsi quizId=uuid değeri alıyor
*/

/* host game init
çeşitli ayarlar ekranı 
klasik seçilince pin oluşturuluyor
*/

router.get('/', ensureAuthenticated, function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/index', { title: 'Teacher init game settings page', userName: req.user.userName });
});

/* host game lobby
pin ekranda sergileniyor
katılanlar gösteriliyor
*/

router.get('/lobby', ensureAuthenticated, function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/lobby', { title: 'Teacher game lobby page' });
});

/* host game start 
öğretmen oyunu başlat düğmesine tıklayınca gelen ekran
3 .. 2 .. 1
*/
router.get('/start', function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/start', { title: 'Teacher game start page 3..2..1' });
});

/* host game block 
önce soru metni geliyor ve soru tipi bilgisi
sonra soru metni resim ve şıklar geliyor geri sayım başlıyor
süre dolunca yada herkes cevaplayınca
başarı grafiği gösteriliyor
next e tıklayınca (son soruda next e tıklayınca game over a gidiyor)
sonra ilk 5 kişi gösteriliyor puan durumu
next e tıklayınca tekrar burada başa dönüyor
son soruda game over a gidiyor
*/
router.get('/gameblock', function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/gameblock', { title: 'Teacher game block page questions comes' });
});

/* host game over 
podyum ilk 3 3 ,2, 1 ve 4-5*/
router.get('/gameover', function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/gameover', { title: 'Teacher game over' });
});

module.exports = router;
