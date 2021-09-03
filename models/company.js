"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   * If filters are sent, go through the keys and create a string for the where clause
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters = {}) {

    //instatiate variable for Where Clause String
    let filteringParameters = "";
    //instatiate the values to send for where clause (prevents sql injection)
    let filteringValue = [];

    //determine if we got query filters
    //if so build the "where clause"
    //we check for those are expected if an unknown parameter is given we throw an error
    const keys = Object.keys(filters);
    if (keys.length > 0) {

      //start the where clause string
      filteringParameters = "WHERE ";
      //used for building the where string
      let filteringArray = [];
      //will be used to match inputs with values provided for query string
      let count = 1;
      let checkMinMax = {};

      //run through the query parameters given, build strings and push to arrays
      for (let key of Object.keys(filters)) {

        if (key == "nameLike") {
          filteringArray.push(`name ILIKE $${count}`);
          filteringValue.push(`%${filters[key]}%`);
        }
        else if (key == "minEmployees") {
          filteringArray.push(`num_employees > $${count}`);
          filteringValue.push(`${filters[key]}`);
          checkMinMax[key] = filters[key];
        }
        else if (key == "maxEmployees") {
          filteringArray.push(`num_employees < $${count}`);
          filteringValue.push(`${filters[key]}`);
          checkMinMax[key] = filters[key];
        }
        else {
          throw new BadRequestError(`Invalid filter: ${key}`);
        }//end if.else clauses
        count += 1;
      }//end of for loop for filters object

      if (((Object.keys(checkMinMax).length) == 2) && (checkMinMax["maxEmployees"] < checkMinMax["minEmployees"])) {
        throw new BadRequestError(`Invalid Min and Max Values provided in query`);
      }
      //upon running through all query parameters, create the string by joining
      if (filteringArray.length > 1) {
        filteringParameters += filteringArray.join(" AND ");
      }
      else {
        filteringParameters += filteringArray[0];
      }

    }//end of if for keys

    //if no where clause, string will persist
    const querySql = `SELECT handle,
                      name,
                      description,
                      num_employees AS "numEmployees",
                      logo_url AS "logoUrl"
                      FROM companies 
                      ${filteringParameters} 
                      ORDER BY name`;

    //make query to database
    const companiesRes = await db.query(querySql, filteringValue);
    //return results
    return companiesRes.rows;

  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
