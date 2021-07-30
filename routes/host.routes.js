const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('./isAuth');
const { validate: uuidValidate } = require('uuid');
const { Query } = require('../utils/queries');
/* 
    hepsi quizId=uuid değeri alıyor
*/

/* host game lobby
pin ekranda sergileniyor
katılanlar gösteriliyor
*/

router.get('/lobby/:quizId', ensureAuthenticated, async function (req, res, next) {

  const quizId = req.params.quizId;
  const userId = req.user.id;
  if (!!quizId && uuidValidate(quizId) && (await Query.quizExists(quizId))) {
    res.render('host/lobby', {
      title: 'quiz composer page',
      audio: '/audio/peritune-spook4.mp3',
    });
  }
  // console.log('data :>> ', data);

  // res.app.locals.user = req.user;
  // console.log('req.user :>> ', req.user);
  // res.render(`host/lobby?quizId=${quizI}`, { title: 'Start a Kahoot Game', userName: req.user.userName });
});

/* router.get('/lobby', ensureAuthenticated, function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/lobby', { title: 'Teacher game lobby page' });
}); */

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
  res.render('host/gameblock', {
    title: 'Teacher game block page questions comes',
    audio: '/audio/peritune-spook4.mp3',
  });
});

/* host game over 
podyum ilk 3 3 ,2, 1 ve 4-5*/
router.get('/gameover', function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/gameover', { title: 'Teacher game over' });
});

router.get('/podium', function (req, res, next) {
  res.app.locals.user = req.user;
  console.log('req.user :>> ', req.user);
  res.render('host/podium', { title: 'Teacher game over' });
});

module.exports = router;
