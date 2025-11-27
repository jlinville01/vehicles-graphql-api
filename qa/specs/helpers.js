// test/helpers.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../server");

chai.use(chaiHttp);

// Make expect global so you don't have to import it in every test file
global.expect = chai.expect;

// Make graphqlRequest global
global.graphqlRequest = function (query, variables = {}) {
  return chai
    .request(app)
    .post("/graphql")
    .send({ query, variables });
};
