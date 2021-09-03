# Jobly Backend

This is a pure API app, taking values from the query string (GET requests) or from a JSON body (other requests). It returns JSON. This gets authentication/authorization with JWT tokens.

## Goals
- Make sure your additions only allow access as specified in our requirements.
- Be thoughtful about function and variable names, and write developer-friendly documentation for every function and route you write.
- Maintain good coverage.
- Use model of test setup where model tests check the underlying database actions and route tests check the underlying model methods.
- Practice test-driven development. Write a test before writing a model method and a route. 

## Scripts
To run this: 
```
    node server.js
```
To run the tests:
```
    jest -i
```

## Part One: Setup / Starter Code
### Goal was to get code ready.
- [x] Download the starter code. Do a quick skim of the code to get a sense of the app.
- [x] Set up db with jobly.sql i.e. jobly and jobly_test. 
- [x] Read the tests and get an understanding.
- [x] Run our tests, with coverage. 
- [x] Start up the server (note that, unlike most exercises, we start this server on port 3001).
- [x] Test the API in Insomnia.
### Primary focus and work updates to: 
- [x] sqlForPartialUpdate -- This function was literally functional.  My work included adding documentation, which required analyzing where this function was used, what inputs were required, how it executed, and what was outputed.  Additionally, I added my own tests for this function. I wrote 13 test cases to test the function's inputs, execution process and outputs.  
See my work: [/helpers/sql.js](/helpers/sql.js) and [/helpers/sql.test.js](/helpers/sql.test.js))

## Part Two: Companies
### Adding Filtering 
- [x] Ability to provide a query string for nameLike, minEmployees, maxEmployees
- [x] Filter capability to find case-insensitive, partial matches for name in companies table.
- [x] Filter capability to show on companies that are above the minEmployees number provided.
- [x] Filter capability to show on companies that are below the maxEmployees number provided.
- [x] If minEmployees is greater than MaxEmployees, app throws an error and provides error message in JSON reply.
- [x] Ensures no other query parameters are provided. If so, it handles the error.
- [x] If no query string sent, it still provides all company as needed. 
- [x] Added comments to help anyone understand what was done

See my work: [/models/company.js](/models/company.js) 
Specific function to review: 

```
static async findAll(filters = {})
```
### Testing
- [x] Edge case added for name parameter to check for case-insensitivity and partial matches
- [x] Test case on all three parameters provided
- [x] Test case with maxEmployees being smaller than minEmployees
- [x] Test case with minEmployees and maxEmployees provided
- [x] Test case with an invalid parameter provided

See my work: [/models/company.test.js](/models/company.test.js) and [/routes/companies.test.js](/routes/companies.test.js) 