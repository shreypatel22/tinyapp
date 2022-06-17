const { assert } = require('chai');

const { getUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUser', function() {
  it('should return a user with valid email', function() {
    const user = getUser("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return a user with valid email', function() {
    const user = getUser("user3@example.com", testUsers)
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID);
  });

});