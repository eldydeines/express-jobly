const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");


describe("SQL For Partial Update Test", function () {

    let dataGood;
    let jsToSQLGood;
    let dataBad = {};
    let jsToSQLBad = {};

    beforeEach(function () {

        dataGood = {
            "firstName": "userf",
            "lastName": "userl",
            "email": "user@user.com",
            "isAdmin": false,
            "name": "company",
            "description": "Company is company.",
            "numEmployees": 100,
            "logoUrl": "logourl"
        };
        jsToSQLGood = {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
            numEmployees: "num_employees",
            logoUrl: "logo_url"
        };
        jsToSQLBad = {
            firstName: "firstname",
            lastName: "lastName",
            numEmployees: "num_employees",
            logoUrl: "logo_url"
        };

    });//end beforeEach


    //Test that the good inputs provides the output of a string and array
    test("all data is good", function () {

        let { setCols, values } = sqlForPartialUpdate(dataGood, jsToSQLGood);
        expect.stringContaining(setCols);
        expect(setCols).toBe(`"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4, "name"=$5, "description"=$6, "num_employees"=$7, "logo_url"=$8`);
        expect.arrayContaining(values);
        expect(values).toEqual(['userf', 'userl', 'user@user.com', false, 'company', 'Company is company.', 100, 'logourl']);

    });//End Test "all data is good"

    test("data is bad, jsSQl is good", function () {
        try {
            sqlForPartialUpdate(dataBad, jsToSQLGood);
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });//End Test "data is bad, jsSQl is good"


    test("data is good, jsSQl is bad but will still pair as requested so function does not fail", function () {
        let { setCols, values } = sqlForPartialUpdate(dataGood, jsToSQLBad);
        console.log("TEST___________________________", setCols, values);
        expect(setCols).toBe(`\"firstname\"=$1, \"lastName\"=$2, \"email\"=$3, \"isAdmin\"=$4, \"name\"=$5, \"description\"=$6, \"num_employees\"=$7, \"logo_url\"=$8`);
    });//End Test "data is good, jsSQl is bad"


});//end Describe 
