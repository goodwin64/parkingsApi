const uuidV4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');

const { ROLE_ADMIN, ROLE_DRIVER } = require('../types/user');
const defaultUsers = require('../models/users.json');


class UsersService {
  constructor() {
    this.users = [...defaultUsers];
    this.lastUserId = this.users.length - 1;
  }

  createUser({ username = '', password = '', avatarUrl = '', gender = '' }) {
    if (!username || !password) {
      return null;
    }

    return {
      authInfo: {
        accessToken: null,
        password,
      },
      personalInfo: {
        id: ++this.lastUserId,
        role: ROLE_DRIVER,
        username,
        avatarUrl,
        gender,
      },
    };
  }

  addUser(user) {
    if (this.isValidUser(user)) {
      this.users.push(user);
      this.saveUsersInDB();
    }
  }

  deleteUser(username) {
    const userIndex = this.users.findIndex((user) => this.getUsername(user) === username);
    this.users.splice(userIndex, 1);
    this.saveUsersInDB();
  }

  saveUsersInDB() {
    const usersJSON = JSON.stringify(this.users, null,  2);
    fs.writeFile(path.join(__dirname, '../models/users.json'), usersJSON, 'utf8', console.log);
  }

  getUserByUsername(username) {
    return this.users.find((user) => user.personalInfo.username === username);
  }

  getUserByCredentials(username, password) {
    return this.users.find((user) => user.personalInfo.username === username && user.authInfo.password === password);
  }

  getUserByAccessToken(accessToken) {
    return this.users.find((user) => user.authInfo.accessToken === accessToken);
  }

  getUserById(id) {
    return this.users.find((user) => user.personalInfo.id === id);
  }

  isUserExist(username) {
    return Boolean(this.getUserByUsername(username));
  }

  createAccessToken() {
    return uuidV4();
  }

  clearAccessToken(user) {
    user.authInfo.accessToken = null;
  }

  isValidUser(user) {
    return (
      Boolean(user)
      && user.authInfo && user.authInfo.password
      && user.personalInfo && user.personalInfo.role && user.personalInfo.username
    );
  }

  getUsername(user) {
    return user.personalInfo.username;
  }

  getUserPublicInfo(user) {
    return user.personalInfo;
  }

  getSuccessfulLoginData(user) {
    return {
      accessToken: user.authInfo.accessToken,
      personalInfo: user.personalInfo,
    };
  }

  getAllUsers() {
    return this.users;
  }

  isAdmin(user) {
    return this.isValidUser(user) && user.personalInfo.role === ROLE_ADMIN;
  }

  isTheSameUser(user1, user2) {
    return this.isValidUser(user1) && this.isValidUser(user2) && user1.id === user2.id;
  }

  setAvatarUrl(user, imageUrl) {
    user.personalInfo.avatarUrl = imageUrl;
  }
}

module.exports = new UsersService();
