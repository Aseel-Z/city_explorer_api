'use strict';

require('dotenv').config();
const PORT = process.env.PORT || 3000
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

const DATABASE_URL = process.env.DATABASE_URL;
const cityApp = express();

const client = new pg.Client(DATABASE_URL);
client.connect();

const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const MOVIE_API_KEY =  process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
cityApp.use(cors());

// Path creation
cityApp.get('/location', handleLocationReq);
cityApp.get('/movies', handleMoviesReq);
cityApp.get('/yelpmovies', handleYelpReq);


function handleLocationReq(req, res) {
  // client input 
  const searchQuery = req.query.city;

  // error message if there is no input
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong');
  };

  // if there is input get the data from the database 
  const values = [searchQuery]
  const sqlQuery = `SELECT * FROM locations WHERE search_query=$1`

  // then check if it is in the database (client that is connected) and pass the query (sql)
  client.query(sqlQuery,values).then( table => {
   if (table.rows.length === 0) {
    throw error;
   }
  res.status(200).json(table.row[0])}).
  catch((error) => {
    // URL API
    const url = `https://us1.locationiq.com/v1/search.php` 
    const locationQueryPara = {
      key: GEO_CODE_API_KEY,
      city: searchQuery,
      format: 'json',
    };
  superagent
    .get(url)
    .query(locationQueryPara)
    .then((locationData) => {
      const newLocation = new Location(searchQuery, locationData.body[0]);
      // send data sent through API to database
      const sqlQuery = `INSERT INTO locations(search_query, formatted_query, longitude, latitude) VALUES( $1, $2, $3, $4)`;
      const values = [newLocation.search_query, newLocation.formatted_query, newLocation.longitude, newLocation.latitude ];
      client.query(sqlQuery,values);    
      res.status(200).send(newLocation);
    })
    .catch((error) =>
      res.status(500).send('Sorry, something went wrong'))
})}

function Location(searchQuery, dataLocation) {
  this.tableName = 'locations'
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}
  

  
function handleMoviesReq(req,res) {
  const searchQuery = req.query.city;
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong')
  }
  const url = `https://api.themoviedb.org/3/search/movie?`
  const movieQueryPara = {
    query: searchQuery,
    key: MOVIE_API_KEY,
    // language:
    // region:
  }
  superagent.get(url).query(movieQueryPara).then((movieData) => {
    const newMovie = new Movie(searchQuery, movieData);
    res.status(200).send(newMovie);
  })
}
function Movie(searchQuery,dataMovie) {
  this.title = dataMovie.results[0].title ;
  this.overview = dataMovie.results[0].overview;
  this.average_votes = dataMovie.results[0].average_votes;
  this.total_votes = dataMovie.results[0].total_votes;
  this.image_url = dataMovie.results[0].image_url;
  this.popularity = dataMovie.results[0].popularity;
  this.released_on = dataMovie.results[0].released_on;
}


function handleYelpReq(req,res) {
  const searchQuery = req.query.city;
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong')
  }
  const url = `https://api.yelp.com/v3/businesses/search`,
  const restaurantQueryPara ={
  categories:'restaurants',
  location: searchQuery
  }
  // API
  superagent
  .get(url).query(restaurantQueryPara).set(`Authorization`,`Bearer ${YELP_API_KEY}`).then((yelpData) => {
    const newYelp = new Yelp(searchQuery, yelpData);
    res.status(200).send(newYelp);
  })
  .catch((error) => {
    res.status(500).send('Sorry, something went wrong');
  });
}
 
function Yelp(searchQuery,dataYelp) {
  this.name = ;
  this.image_url =;
  this.price =;
  this.rating = ;
  this.url = ;
} 

cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));

function allError(req, res) {
  res.status(500).send('Sorry, something went wrong');
}

// error handler for all types of errors
cityApp.use('*', allError);

