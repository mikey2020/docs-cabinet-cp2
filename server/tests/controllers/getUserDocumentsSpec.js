import supertest from 'supertest';
import dotenv from 'dotenv';
import JWT from 'jsonwebtoken';
import chai from 'chai';
import Document from '../../models/Document';
import app from '../../app';

dotenv.config();
const expect = chai.expect;

const request = supertest(app);
const getUserDocumentsEndpoint = '/api/users';

describe('When it receives a GET request, the /api/users/<id>/documents endpoint', () => {
  const regularUserProfile = {
    userId: 0,
    firstName: 'Lagbaja',
    lastName: 'Anonymous',
    username: 'foo@example.com',
    roleId: 0
  };

  const adminUserProfile = {
    userId: Number(process.env.DEFAULT_ADMIN_USER_USERID),
    firstName: process.env.DEFAULT_ADMIN_USER_FIRSTNAME,
    lastName: process.env.DEFAULT_ADMIN_USER_LASTNAME,
    username: process.env.DEFAULT_ADMIN_USER_USERNAME,
    roleId: process.env.DEFAULT_ADMIN_USER_ROLEID
  };

  const dummyDocument = {
    title: 'Test document',
    docContent: 'Lorem ipsum',
    access: 'public',
    categories: 'random',
    tags: 'random',
    createdBy: 0
  };

  before('Create a dummy document', (done) => {
    Document
      .create(dummyDocument)
      .then(() => {
        done();
      });
  });

  after('Remove the sample document used in this suite\'s specs', (done) => {
    Document
      .destroy({ where: { title: dummyDocument.title } })
      .then(() => {
        done();
      });
  });

  const regularUserToken = JWT.sign(
    regularUserProfile,
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '3d' }
  );
  it('should reject requests from non-admin users', (done) => {
    request.get(getUserDocumentsEndpoint)
      .set('x-docs-cabinet-authentication', regularUserToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403)
      .expect({
        error: 'ForbiddenOperationError'
      }, done);
  });

  const validToken = JWT.sign(
    adminUserProfile,
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '3d' }
  );
  it('should reject requests where the target user id is invalid', (done) => {
    request.get(`${getUserDocumentsEndpoint}/INVALID_ID/documents`)
      .set('x-docs-cabinet-authentication', validToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .expect({
        error: 'InvalidUserIdError'
      }, done);
  });

  const targetUserId = 0;
  it('should reject requests where another path apart from "documents" is' +
    ' used', (done) => {
    request.get(`${getUserDocumentsEndpoint}/${targetUserId}/foo`)
      .set('x-docs-cabinet-authentication', validToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .expect({
        error: 'UnrecognizedPathError'
      }, done);
  });

  it('should reject requests where no existing user has the id supplied', (done) => {
    request.get(`${getUserDocumentsEndpoint}/6543210/documents`)
      .set('x-docs-cabinet-authentication', validToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        error: 'TargetUserNotFoundError'
      }, done);
  });

  it('should successfully retrieve a given user\'s documents, if any', (done) => {
    request.get(`${getUserDocumentsEndpoint}/${targetUserId}/documents`)
      .set('x-docs-cabinet-authentication', validToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.documents).to.not.equal(undefined);
        expect(Array.isArray(res.body.documents)).to.equal(true);
        done();
      });
  });
});