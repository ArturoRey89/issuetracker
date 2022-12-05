const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let globalId = '6387e8062fef1b7516eb7593'; 
suite('Functional Tests', function() {
  suite('POST /api/issues/{project}', function () {
    const date_tol = 60000;
    test('Create an issue with every field',function (done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({issue_title: "test1",
              issue_text: "test2",
              created_by: "test3",
              assigned_to: "test4",
              status_text: "test5"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.strictEqual(res.body.issue_title, "test1");
          assert.strictEqual(res.body.issue_text, "test2");
          assert.strictEqual(res.body.created_by, "test3");
          assert.approximately(new Date(res.body.created_on).getTime(), new Date().getTime(), date_tol);
          assert.approximately(new Date(res.body.updated_on).getTime(), new Date().getTime(), date_tol);
          assert.strictEqual(res.body.assigned_to, "test4");
          assert.strictEqual(res.body.status_text, "test5");
          done();
        });
    })

    test('Create an issue with only required fields',function (done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({issue_title: "test1",
              issue_text: "test2",
              created_by: "test3"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.strictEqual(res.body.issue_title, "test1");
          assert.strictEqual(res.body.issue_text, "test2");
          assert.strictEqual(res.body.created_by, "test3");
          assert.approximately(new Date(res.body.created_on).getTime(), new Date().getTime(), date_tol);
          assert.approximately(new Date(res.body.updated_on).getTime(), new Date().getTime(), date_tol);
          assert.isString(res.body.assigned_to, "Should be an empty string");
          assert.isString(res.body.status_text, "Should be an empty string");
          done();
        });
    })

    test('Create an issue with missing required fields',function (done) {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({issue_title: "test",
              issue_text: "test"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          assert.strictEqual(res.status, 500);
          done();
        });
    })
  });


  suite('GET /api/issues/{project}', function () {
    test('View issues on a project',function (done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "should return array");
          assert.isAtLeast(res.body.length, 1, "Should not be empty array");
          assert.hasAllKeys(res.body[0], 
            ["assigned_to", "status_text", "_id", 
            "open" , "issue_title", "issue_text", 
            "created_by", "created_on", "updated_on"]);
          done();
        });
    })
 
    test('View issues on a project with one filter',function (done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({open: false})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "should return array");
          assert.isAtLeast(res.body.length, 1, "Should not be empty array");
          assert.hasAllKeys(res.body[0], 
            ["assigned_to", "status_text", "_id", 
            "open" , "issue_title", "issue_text", 
            "created_by", "created_on", "updated_on"]);
          done();
        });
    })
   
    test('View issues on a project with multiple filters',function (done) {
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query( {issue_title: "First post", created_by: "ME"} )
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "should return array");
          assert.isAtLeast(res.body.length, 1, "Should not be empty array");
          assert.hasAllKeys(res.body[0], 
            ["assigned_to", "status_text", "_id", 
            "open" , "issue_title", "issue_text", 
            "created_by", "created_on", "updated_on"]);
          done();
        });
    })
  });

  suite('PUT /api/issues/{project}', function () {
    test('Update one field on an issue',function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({ _id: globalId,
              issue_text: "something new"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '6387e8062fef1b7516eb7593');
          assert.notExists(res.body.error);
          done();
        });
    })

    test('Update multiple fields on an issue',function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({ _id: globalId,
              assigned_to: "User",
              status_text: "New status",
              open: false,
              issue_title: "New title",
              issue_text: "New text",
              created_by: "New user"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '6387e8062fef1b7516eb7593');
          assert.notExists(res.body.error);
          done();
        });
    })
    
    test('Update an issue with missing _id',function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    })
    
    test('Update an issue with no fields to update',function (done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({ _id: globalId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.notExists(res.body.result);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, '6387e8062fef1b7516eb7593');
          done();
        });
    })
    
    test('Update an issue with an invalid _id',function (done) {
      chai
        .request(server)
        .del('/api/issues/apitest')
        .send({ _id: 'globalId' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.notExists(res.body.result);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'globalId' );
          done();
        });
    })
  });

  suite('DELETE  /api/issues/{project}', function () {
    test('Delete an issue',function (done) {
      chai
        .request(server)
        .del('/api/issues/apitest')
        .send({ _id: globalId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.notExists(res.body.error);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, '6387e8062fef1b7516eb7593');
          done();
        });
    })
    test('Delete an issue with an invalid _id',function (done) {
      chai
        .request(server)
        .del('/api/issues/apitest')
        .send({ _id: globalId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.notExists(res.body.result);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '6387e8062fef1b7516eb7593');
          done();
        });
    })

    test('Delete an issue with missing _id',function (done) {
      chai
        .request(server)
        .del('/api/issues/apitest')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.notExists(res.body.result);
          assert.equal(res.body.error, 'missing _id');
          done()
        });
    })
  });
});
