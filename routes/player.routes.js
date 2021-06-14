const express = require('express');
const router = express.Router();

/* enter pin screen */
router.get('/', function (req, res, next) {
    res.render('player/index', { title: 'player enter pin' });
});

/* enter nickname screen */
router.get('/join', function (req, res, next) {
    res.render('player/join', { title: 'player enter nickname' });
});

/* see your name on teacher screen */
router.get('/ingame', function (req, res, next) {
    res.render('player/ingame', { title: 'check you are in' });
});

/* teacher started game and get ready 3..2..1 */
router.get('/getready', function (req, res, next) {
    res.render('player/getready', { title: 'get ready 3..2..1' });
});

/* soru metni geliyor ve soru tipi bilgisi
sonra soru şıkları geliyor ve geri sayım burada başlıyor */
router.get('/gameblock', function (req, res, next) {
    res.render('player/gameblock', { title: 'soru cevaplama zamanı' });
});

/* burada çok hızlısın vs */
router.get('/answer/sent', function (req, res, next) {
    res.render('player/answer-sent', { title: 'cevaplandı' });
});

/* doğru yanlış sonucu ve alınan puan gösteriliyor */
router.get('/answer/result', function (req, res, next) {
    res.render('player/answer-result', { title: 'doğru yanlış ve puan' });
});

/* quiz bittiğinde gelen ekran
toplam puan durumu doğru/yanlış sayısı ve quiz başarı sırası gösteriliyor */
router.get('/ranking', function (req, res, next) {
    res.render('player/ranking', { title: 'doğru yanlış sayısı puan ve sıralama' });
});

module.exports = router;
