const { sequelize } = require('./db/models');

async function main() {
  try {
    await sequelize.sync();
  } catch (error) {
    console.log('error :>> ', error);
  }
}

main();
