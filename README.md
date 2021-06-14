# mood

METU Online Oyun Desteği

host::index ?quizId=77616a1c-51e6-4eac-be78-8807a7966805
pin oluşturuluyor -> çeşitli ayarlar ekranı

host::lobby lobby?quizId=77616a1c-51e6-4eac-be78-8807a7966805

::index -> pin giriş ekranı ::index
::join join -> nickname ::join
::ingame instructions -> girdin adını görüyor musun
host::start start?quizId=77616a1c-51e6-4eac-be78-8807a7966805

::start start -> 3 2 1 sayım

host::gameblock gameblock?quizId=77616a1c-51e6-4eac-be78-8807a7966805

::getready getready -> soru metni geliyor

::gameblock gameblock -> seçenekler geliyor
::answer/sent answer/sent -> cevap şıkkına tıklayınca
::answer/result answer/result -> süre dolunca / herkes işaretleyince
bu grup tekrar ediyor

host::gameover gameover?quizId=77616a1c-51e6-4eac-be78-8807a7966805
son soruda burası geliyor soru puanlaması gelmiyor

::ranking ranking
