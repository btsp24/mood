'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert(
            'LobbyMusics',
            [
                {
                    id: 1,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-classic-game-48.1ba1333d.webm',
                },
                {
                    id: 2,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-fantasy.941e959b.webm',
                },
                {
                    id: 3,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-adventure.8c6e1315.mp3',
                },
                {
                    id: 4,
                    audioURL: 'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-disco.6d687ab3.webm',
                },
                {
                    id: 5,
                    audioURL: 'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-funk.d0113881.webm',
                },
                {
                    id: 6,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-80svibe.017d2d3d.webm',
                },
                {
                    id: 7,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-reggae.9b02f31a.webm',
                },
                {
                    id: 8,
                    audioURL: 'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-dance.f980947b.webm',
                },
                {
                    id: 9,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-beatbox.9705e58d.webm',
                },
                {
                    id: 10,
                    audioURL: 'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-8bit.66e26b45.webm',
                },
                {
                    id: 11,
                    audioURL: 'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-space.214d7e5b.webm',
                },
                {
                    id: 12,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-indiepop.d04177ab.webm',
                },
                {
                    id: 13,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-christmas.0cabd634.webm',
                },
                {
                    id: 14,
                    audioURL:
                        'https://assets-cdn.kahoot.it/player/v2/assets/music/lobby-halloween.e6f5897b.webm',
                },
            ],
            {}
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('LobbyMusics', null, {});
    },
};
