import supertest from 'supertest'
import server from '../server.js'
import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/index.js";

const request = supertest(server);
let mongoServer, adminCookie, userId1, userId2, userCookie, groupId, messageId;

describe('API Integration Tests :: Happy path', () => {

  before(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });
  
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a new admin with valid admin email and password from .env', async() => {
    const userData = {
        "first_name": "dipen",
        "last_name": "vaghela",
        "email": ADMIN_EMAIL, 
        "password": ADMIN_PASSWORD
    };

    const response = await request.post('/v1/users/admin')
      .send(userData)

    expect(response.status).to.equal(201);
    expect(response.body.data.email).to.equal(ADMIN_EMAIL);
  });

  it('should login successfully with valid admin credentials', async() => {
    const loginData = {
      "email": ADMIN_EMAIL, 
      "password": ADMIN_PASSWORD
    };
    const response = await request.post('/v1/auth/login')
      .send(loginData)

    expect(response.status).to.equal(200);
    adminCookie = response.headers['set-cookie'][0].split(";")[0] // added admin session for other API use
  });

  it('should add user if logged in as an admin', async() => {
    const userData = {
      "first_name": "user1",
      "last_name": "last1",
      "email": 'user1@email.com', 
      "password": 'user1@123'
    };

    const response = await request.post('/v1/users')
      .set('Cookie', adminCookie)
      .send(userData)

    expect(response.status).to.equal(201);
    expect(response.body.data.email).to.equal('user1@email.com');
    userId1 = response.body.data._id
  });

  it('should add another user if logged in as an admin', async() => {
    const userData = {
      "first_name": "user3",
      "last_name": "last3",
      "email": 'user3@email.com', 
      "password": 'user3@123'
    };

    const response = await request.post('/v1/users')
      .set('Cookie', adminCookie)
      .send(userData)

    expect(response.status).to.equal(201);
    expect(response.body.data.email).to.equal('user3@email.com');
    userId2 = response.body.data._id
  });

  it('should list all users', async() => {
    const response = await request.get('/v1/users')
      .set('Cookie', adminCookie)

    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.equal(2);
    expect(response.body.data[0].firstName).to.equal('user1');
    expect(response.body.data[0].email).to.equal('user1@email.com');
  });

  it('should update user if logged in as an admin', async() => {
    const userData = {
      "first_name": "user2",
      "last_name": "last2",
      "email": 'user2@email.com', 
      "password": 'user2@123'
    };

    const response = await request.patch('/v1/users/'+userId1)
      .set('Cookie', adminCookie)
      .send(userData)

    expect(response.status).to.equal(204);
  });

  it('should list all updated users', async() => {
    const response = await request.get('/v1/users')
      .set('Cookie', adminCookie)

    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.equal(2);
    expect(response.body.data[0].firstName).to.equal('user2');
    expect(response.body.data[0].email).to.equal('user2@email.com');
  });

  it('should login successfully with valid user credentials', async() => {
    const loginData = {
      "email": 'user2@email.com', 
      "password": 'user2@123'
    };
    const response = await request.post('/v1/auth/login')
      .send(loginData)

    expect(response.status).to.equal(200);
    userCookie = response.headers['set-cookie'][0].split(";")[0] // added user session for other API use
  });

  it('should create a group if logged in as user/admin', async() => {
    const groupData = {
      "name": "test Group"
    };
    const response = await request.post('/v1/groups')
      .set('Cookie', userCookie)
      .send(groupData)

    expect(response.status).to.equal(201);
    expect(response.body.data.name).to.equal('test Group');
    groupId = response.body.data._id
  });

  it('should add members if logged in as user/admin', async() => {
    const members = {
      "members": [userId2]
    };
    const response = await request.post('/v1/groups/'+groupId+'/members')
      .set('Cookie', userCookie)
      .send(members)

    expect(response.status).to.equal(201);
  });

  it('should list all created gropus', async() => {
    const response = await request.get('/v1/groups')
      .set('Cookie', userCookie)

    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.equal(1);
    expect(response.body.data[0].name).to.equal('test Group');
  });

  it('should send message if logged in as user/admin', async() => {
    const message = {
      "content": "Hello world"
    };
    const response = await request.post('/v1/messages/'+groupId)
      .set('Cookie', userCookie)
      .send(message)

    expect(response.status).to.equal(201);
    expect(response.body.data.content).to.equal('Hello world');
    messageId = response.body.data._id
  });

  it('should like message if logged in as user/admin', async() => {
    const response = await request.patch('/v1/messages/'+messageId+'/like')
      .set('Cookie', userCookie)

    expect(response.status).to.equal(204);
  });

  it('should get detail of given group_id', async() => {
    const response = await request.get('/v1/groups/'+groupId)
      .set('Cookie', userCookie)

    const expectedResp = {
      "name": "test Group",
      "creator": "user2_last2",
      "members": [
        "user2_last2",
        "user3_last3"
      ],
      "messages": [
        {
          "id": messageId,
          "content": "Hello world",
          "sender": "user2_last2",
          "likes": [
            "user2_last2"
          ]
        }
      ]
    }

    expect(response.status).to.equal(200);
    expect(response.body.data).to.deep.equal(expectedResp);
  });

  it('should delete the group and its all messages', async() => {
    const response = await request.delete('/v1/groups/'+groupId)
      .set('Cookie', userCookie)

    expect(response.status).to.equal(204);
  });

  it('should list all remaining created gropus', async() => {
    const response = await request.get('/v1/groups')
      .set('Cookie', userCookie)

    expect(response.status).to.equal(200);
    expect(response.body.data.length).to.equal(0);
    expect(response.body.data).to.deep.equal([]);
  });

  it('should logout successfully', async() => {
    const response = await request.get('/v1/auth/logout')
      .set('Cookie', userCookie)

    expect(response.status).to.equal(200);
    expect(response.headers['set-cookie']).to.equal(undefined);
  });

  // will receive 401 (unauthorized) with session expired message for all API after logout
  it('should return 401 if list users api call after logout', async() => {
    const response = await request.get('/v1/users')
      .set('Cookie', userCookie)
    
    expect(response.status).to.equal(401);
    expect(response.body.error.message).to.equal('This session has expired. Please login');
  });

});
