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
- [x] sqlForPartialUpdate -- This function was literally functional.  My work included adding documentation, which required analyzing where this function was used, what inputs were required, how it executed, and what was outputed.  Additionally, I added my own tests for this function. I wrote 13 test cases to test the function's inputs, execution process and outputs.  (See my work on [/helpers/sql.js](/helpers/sql.js) and [/helpers/sql.test.js](/helpers/sql.test.js))