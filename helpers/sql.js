const { BadRequestError } = require("../expressError");


/*  
    Function prepares the data received the from the request to ensure it is in the SQL format no matter what it is sent
    
    INPUTS: 
      Function receives all data to update from data models (companies, users) and puts it in variable "dataToUpdate".  
      For the second variable, jsToSql, this takes in all object JavaScript camelcase variables and saves them to SQL 
      naming conventions with underscores.

    EXECUTION: 
      1) -keys- variable will save the output of Object.keys() method (which returns an array of a given object's own 
      enumerable property names, iterated in the same order that a normal loop would.
      2) Function validates there is data with keys.length (If not, error is thrown.)
      3) -cols- variable will map out column names and index number to be stored as strings into a new array
      
    OUTPUTS:
      Function will return an object wit the column names and the indexed object value
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
