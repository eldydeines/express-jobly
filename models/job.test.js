"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create job", function () {
    const newJob = {
        title: "new test job",
        salary: 100000,
        equity: 0.08,
        company_handle: "c2"
    };

    test("create job works", async function () {
        let job = await Job.create(newJob);
        expect(job).toHaveProperty("title", "new test job");
        expect(job).toHaveProperty("id");
        expect(job).toHaveProperty("equity", "0.08");
    });

    test("bad request with dupe", async function () {
        try {
            await Job.create(newJob);
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** get */

describe("get job", function () {

    const newJob = {
        title: "new test job",
        salary: 100000,
        equity: 0.08,
        company_handle: "c2"
    };

    test("get job works", async function () {

        const job = await Job.create(newJob);
        let testJob = await Job.get(job.id);
        expect(testJob).toEqual({
            id: job.id,
            title: "new test job",
            salary: 100000,
            equity: "0.08",
            handle: "c2"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("job update", function () {

    const newJob = {
        title: "new test job",
        salary: 100000,
        equity: 0.08,
        company_handle: "c2"
    };

    const updateData = {
        title: "test 1 job",
        salary: 50000,
    };

    test("job update works", async function () {
        const job = await Job.create(newJob);
        let jobToUpdate = await Job.update(job.id, updateData);
        expect(jobToUpdate).not.toEqual(job);
        expect(jobToUpdate).toHaveProperty("title", "test 1 job");
    });


    test("not found if no such company", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            const job = await Job.create(newJob);
            await Job.update(job.id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** remove */

describe("remove job", function () {

    const newJob = {
        title: "new test job",
        salary: 100000,
        equity: 0.08,
        company_handle: "c2"
    };

    test("works to remove job", async function () {
        const job = await Job.create(newJob);
        await Job.remove(job.id);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${job.id}`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
