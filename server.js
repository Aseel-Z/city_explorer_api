'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

const DATABASE_URL = process.env.DATABASE_URL;
const cityApp = express();

const client = new pg.Client(DATABASE_URL);
client.connect();

const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
cityApp.use(cors());

// Path creation
cityApp.get('/location', handleLocationReq);


client.query(sqlQuery,values)

function handleLocationReq(req, res) {

  // client input 
  const searchQuery = req.query.city;
  // URL 
  const locationQueryPara = {
    key: GEO_CODE_API_KEY,
    city: searchQuery,
    format: 'json',
  };

  // error message if there is no input
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong');
  };

  // if there is input get the data from the database 
  const values = [searchQuery]
  const sqlQuery = `SELECT * FROM locations WHERE search_query=$1`

  // then check if it is in the database (client that is connected) and pass the query (sql)
  client.query(sqlQuery,values).then(

  )

  if 
  const sqlQuery = `INSERT INTO locations(search_query, formatted_query, longitude, latitude) VALUES( $1, $2, $3, $4)`;
  const values = [newLocation.search_query, newLocation.formatted_query, newLocation.longitude, newLocation.latitude ]


  superagent
    .get(url)
    .query(locationQueryPara)
    .then((locationData) => {
      const  = new Location(searchQuery, locationData.body[0]);
      res.status(200).send(newLocation);
    })
    .catch((error) => {
      res.status(500).send('Sorry, something went wrong');
    });
}
function Location(searchQuery, dataLocation) {
  this.tableName = 'locations'
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}



cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));

function allError(req, res) {
  res.status(500).send('Sorry, something went wrong');
}

// error handler for all types of errors
cityApp.use('*', allError);


// when searchquery is entered we either get the data from an API request or from the database created (cityDB)
// response will be sent    