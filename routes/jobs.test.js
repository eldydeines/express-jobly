"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u4Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "test job 1",
        salary: 100000,
        equity: 0.08,
        company_handle: "c1",
    };

    test("not ok for users", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "test job",
                salary: 100000,
                equity: 0.08,
                company_handle: "c1",
            })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body.job).toHaveProperty("title", "test job");
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                salary: 60000
            })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                ...newJob,
                salary: "78"
            })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
    test("works for anon", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app).get(`/jobs/${jobs.rows[0].id}`)
        const { job } = resp.body;
        expect(job).toHaveProperty("title", `${jobs.rows[0].title}`);
    });

    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");

        expect(resp.body.jobs[0]).toHaveProperty("title", 'test job 1');
        expect(resp.body.jobs[0]).toHaveProperty("handle", 'c1');
        expect(resp.body.jobs[0]).toHaveProperty("salary", 100000);
        expect(resp.body.jobs[0]).toHaveProperty("equity", '0.08');

        expect(resp.body.jobs[1]).toHaveProperty("title", 'test job 2');
        expect(resp.body.jobs[1]).toHaveProperty("handle", 'c2');
        expect(resp.body.jobs[1]).toHaveProperty("salary", 0);
        expect(resp.body.jobs[1]).toHaveProperty("equity", '0.05');
        expect(resp.body.jobs).toHaveLength(2);
    }); //end test

    test("parameters testing title, minSalary, hasEquity", async function () {
        const resp = await request(app).get(`/jobs`).query({ "title": "job", "minSalary": "10000", "hasEquity": "true" });
        expect(resp.body.jobs[0]).toHaveProperty("title", 'test job 1');
        expect(resp.body.jobs[0]).toHaveProperty("salary", 100000);
        expect(resp.body.jobs[0]).toHaveProperty("equity", '0.08');
        expect(resp.body.jobs).toHaveLength(1);

    });// end test

    test("parameters testing title only with case sensitivity and contains", async function () {
        const resp = await request(app).get(`/jobs`).query({ "title": "JOB" });
        expect(resp.body.jobs[0]).toHaveProperty("title", 'test job 1');
        expect(resp.body.jobs[1]).toHaveProperty("title", 'test job 2');
        expect(resp.body.jobs).toHaveLength(2);
    });// end test

    test("parameters testing only minSalary", async function () {
        const resp = await request(app).get(`/jobs`).query({ "minSalary": "10000" });
        expect(resp.body.jobs[0]).toHaveProperty("title", 'test job 1');
        expect(resp.body.jobs[0]).toHaveProperty("salary", 100000);
        expect(resp.body.jobs[0]).toHaveProperty("equity", '0.08');
        expect(resp.body.jobs).toHaveLength(1);

    });// end test

    test("parameters testing only with hasEquity", async function () {
        const resp = await request(app).get(`/jobs`).query({ "hasEquity": "true" });
        expect(resp.body.jobs[0]).toHaveProperty("title", 'test job 1');
        expect(resp.body.jobs[0]).toHaveProperty("equity", '0.08');
        expect(resp.body.jobs[1]).toHaveProperty("title", 'test job 2');
        expect(resp.body.jobs[1]).toHaveProperty("equity", '0.05');
        expect(resp.body.jobs).toHaveLength(2);
    });// end test

    test("invalid parameter", async function () {
        const resp = await request(app).get(`/jobs`).query({ "company_handle": "c1" });
        expect(resp.statusCode).toEqual(400);
    });//end test


    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
    test("works for admins", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .patch(`/jobs/${jobs.rows[0].id}`)
            .send({ title: "update to job title" })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.body.job).toHaveProperty("title", "update to job title");
    });

    test("unauth for anon", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .patch(`/jobs/${jobs.rows[0].id}`)
            .send({ title: "update to job title" });
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for any logged in user that is not an admin", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .patch(`/jobs/${jobs.rows[0].id}`)
            .send({ title: "update to job title" })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "new title",
            })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on handle change attempt", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .patch(`/jobs/${jobs.rows[0].id}`)
            .send({ company_handle: "c1-new" })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .patch(`/jobs/${jobs.rows[0].id}`)
            .send({ equity: 0.80 })
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});



/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {

    test("unauth for any logged in user that is not an admin", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .delete(`/jobs/${jobs.rows[0].id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .delete(`/jobs/${jobs.rows[0].id}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("works for admins", async function () {
        const jobs = await db.query(`SELECT * FROM jobs`);
        const resp = await request(app)
            .delete(`/jobs/${jobs.rows[0].id}`)
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.body).toEqual({ deleted: `${jobs.rows[0].id}` });
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${u4Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});
