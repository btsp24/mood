const { sequelize } = require('./db/models');

async function main() {
    await sequelize.sync();
}

main();
