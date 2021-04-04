'use strict';
// dotev
require('dotenv').config();

// port

const PORT = process.env.PORT || 3000;
const ENV = process.env.ENV;

// Depedencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

// API Keys & Database URLs
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const WEATHER_CODE_API_KEY = process.env.WEATHER_CODE_API_KEY;
const PARK_CODE_API_KEY = process.env.PARK_CODE_API_KEY;

// express wireframe - app launch
const cityApp = express();
cityApp.use(cors());

// pg = node-postgres (a collection of node.js modules for interfacing with your PostgreSQL database system)
// if it was on local it will return a value for ENV which is a variable I added to .env that will be in local and not in ureko because of get ignore
let client = '';
if (ENV === 'DEV') {
  client = new pg.Client({
    connectionString: DATABASE_URL
  });
} else {
  client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {}
  });
}

// connect app to the postgres database
client.connect();

// Path creation
cityApp.get('/location', handleLocationReq);
cityApp.get('/weather', handleWeatherReq);
cityApp.get('/parks', handleParksReq);

// Location Request Handler Function + Constructor Function
function Location(searchQuery, dataLocation) {
  this.tableName = 'locations'
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}


function getDataFromAPI() {
  const url = `https://us1.locationiq.com/v1/search.php`;
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
      const values = [newLocation.search_query, newLocation.formatted_query, newLocation.longitude, newLocation.latitude];
      client.query(sqlQuery, values);
      res.status(200).send(newLocation);
    })
};


function handleLocationReq(req, res) {
  try {
    // client input 
    const searchQuery = req.query.city;

    // error message if there is no input
    if (!searchQuery) {
      res.status(500).send('Sorry, something went wrong');
    };

    // if there is input get the data from the database in it is already there or get it from API and then insert it into database
    // get the data from database where the value

    const values = [searchQuery]
    const sqlQuery = `SELECT * FROM locations WHERE search_query=$1`

    // then check if it is in the database (client that is connected) and pass the query (sql)
    client.query(sqlQuery, values).then(tableResult => {

      if (tableResult.rows.length === 0) {
        getDataFromAPI();
      } else {
        res.status(200).json(table.row[0])
      }
    })
  }
  catch (error) {
    res.status(500).send('Sorry, something went wrong')
  }
}
  

  
function handleMoviesReq(req,res) {
  const searchQuery = req.query.city;
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong')
  }
  const url = `https://api.themoviedb.org/3/search/movie?`
  const movieQueryPara {
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
  const url = `GET https://api.yelp.com/v3/businesses/search`,
  const restaurantQueryPara {
  categories:'restaurants',
  location: searchQuery
  }
  // API
  superagent
  .get(url).query(restaurantQueryPara).set('Authorization':'Bearer ',`${YELP_API_KEY}`).then((yelpData) => {
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

// Weather Request Handler Function + Constructor Function 

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.valid_date
}

function handleWeatherReq(req, res) {
  try {
    const searchQueryLat = req.query.lat;
    const searchQueryLon = req.query.lon;
    if (!searchQueryLat || !searchQueryLon) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
    const weatherQueryPara = {
      key: WEATHER_CODE_API_KEY,
      lat: searchQueryLat,
      lon: searchQueryLon,
      format: 'json',
    };

    superagent
      .get(url)
      .query(weatherQueryPara)
      .then((weatherData) => {
        const dailyWeather = weatherData.body.data.map((weather) => {
          return new Weather(weather);
        });
        res.status(200).send(dailyWeather.slice(0, 9));
      });

  } catch (error) {
    res.status(500).send('internal weather server error occured');
  }
}

// Parks Request Handler Function + Constructor Function

function Park(parkData) {
  this.name = parkData.fullName;
  this.description = parkData.description;
  this.address = `${parkData.addresses[0].line1}${parkData.addresses[0].city}${parkData.addresses[0].stateCode}${parkData.addresses[0].postalCode}`
  this.fees = parkData.fees[0] || '0.00';
  this.url = parkData.url;
}

function handleParksReq(req, res) {
  try {
    const searchQuery = req.query.location;
    if (!searchQuery) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://developer.nps.gov/api/v1/parks`
    const parkQueryPara = {
      api_key: PARK_CODE_API_KEY,
      location: searchQuery,
      limit: '10'
    };
    superagent
      .get(url)
      .query(parkQueryPara)
      .then((parkData) => {
        const parks = parkData.body.data.map((park) => {
          return new Park(park);
        });
        res.status(200).send(parks);
      });
  } catch (error) {
    res.status(500).send('internal parks server error occured');
  }
}

// app listener
cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));


// General/All Error Handler
function allError(req, res) {
  res.status(500).send('Sorry, something went wrong');
}

cityApp.use('*', allError);


