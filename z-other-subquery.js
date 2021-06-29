/* in memory sequelize playground */

const { Sequelize, Op, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Customer = sequelize.define('Customer', {
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING },
});
Customer.prototype.getOrderSummary = async function () {
  return await Order.findOne({
    where: {
      CustomerId: this.id,
    },
    attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
    group: ['CustomerId'],
  });
};

const Order = sequelize.define('Order', {
  amount: { type: Sequelize.FLOAT },
});

Customer.hasMany(Order, { constraints: true });
Order.belongsTo(Customer, { constraints: true });

function displayResults(results) {
  results.forEach(function (c) {
    console.log(c.toJSON());
  });
  console.log('----------------------------------');
}

let firstCustomer;
let secondCustomer;

sequelize
  .sync({ force: true })
  .then(function () {
    return Customer.create({ firstName: 'Test', lastName: 'Testerson' });
  })
  .then(function (user1) {
    firstCustomer = user1;
    return Customer.create({ firstName: 'Invisible', lastName: 'Hand' });
  })
  .then(function (user2) {
    secondCustomer = user2;
    return Order.create({ CustomerId: firstCustomer.id, amount: 5 });
  })
  .then(function () {
    return Order.create({ CustomerId: firstCustomer.id, amount: 10 });
  })
  .then(function () {
    return Order.create({ CustomerId: firstCustomer.id, amount: 20 });
  })
  .then(function () {
    return Order.create({ CustomerId: secondCustomer.id, amount: 99 });
  })
  /*
          Query testing code here
    */
  //   .then(function () {
  //     return Order.findAll({
  //       attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'], 'CustomerId'],
  //       group: ['CustomerId'],
  //     });
  //   })
  //   .then(displayResults)

  // .then(function () {
  //   return sequelize.query(
  //     'SELECT *, (SELECT SUM("Orders"."amount") FROM "Orders" WHERE "Orders"."CustomerId" = "Customer"."id") AS "totalAmount" FROM "Customers" AS "Customer";',
  //     Customer,
  //     { raw: false }
  //   );
  // })
  // .then(console.dir)

  // .then(function () {
  //   return Customer.findAll({
  //     attributes: Object.keys(Customer.attributes).concat([
  //       [
  //         sequelize.literal(
  //           '(SELECT SUM("Orders"."amount") FROM "Orders" WHERE "Orders"."CustomerId" = "Customer"."id")'
  //         ),
  //         'totalAmount',
  //       ],
  //     ]),
  //   });
  // })
  // .then(displayResults)
  .then(function () {
    return Customer.findOne({ where: { id: 1 } });
  })
  .then(function (customer) {
    return customer.getOrderSummary();
  })
  .then(function (customer) {
    console.dir(customer.toJSON());
  })
  .then(function () {
    process.exit(0);
  });
