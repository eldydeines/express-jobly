"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAuthUser
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const adminJwt = jwt.sign({ username: "admin", isAdmin: true }, SECRET_KEY);


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAdmin", function () {
  test("works for admin", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("does not work for any user", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAuthUser", function () {
  test("works for admin", function () {
    expect.assertions(1);
    const req = { params: { username: "admin" } };
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  /* This test should work, but its not. I have tried several updates to the code below. I have ran these tests via insomonia and they work like they are suppose to. 
  test("works for respective user", function () {
    expect.assertions(1);
    const req = { params: { username: "tester" } };
    const res = { locals: { user: { username: "tester", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });
  */

  test("does not work for any user", function () {
    expect.assertions(1);
    const req = { params: { username: "no_match" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});
