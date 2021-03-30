'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT;
const cityApp = express();
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_CODE_API_KEY = process.env.WEATHER_CODE_API_KEY;
const PARK_CODE_API_KEY = process.env.PARK_CODE_API_KEY;
cityApp.use(cors());

// Path creation
cityApp.get('/location', handleLocationReq);
cityApp.get('/weather', handleWeatherReq);
cityApp.get('/parks', handleParksReq);
// error handler for all types of errors


function handleLocationReq(req, res) {
  const url = `https://us1.locationiq.com/v1/search.php`;
  const searchQuery = req.query.city;
  const locationQueryPara = {
    key: GEO_CODE_API_KEY,
    city: searchQuery,
    format: 'json',
  };
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong');
  }
  superagent
    .get(url)
    .query(locationQueryPara)
    .then((locationData) => {
      const newLocation = new Location(searchQuery, locationData.body[0]);
      res.status(200).send(newLocation);
    })
    .catch((error) => {
      res.status(500).send('Sorry, something went wrong');
    });
}
function Location(searchQuery, dataLocation) {
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}

function handleWeatherReq(req, res) {
  try {
    const searchQuery = req.query;
    if (!searchQuery) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
    const weatherQueryPara = {
      key: WEATHER_CODE_API_KEY,
      lat: searchQuery.longitude,
      lon: searchQuery.latitude,
      format: 'json',
    };
    superAgent
      .get(url)
      .query(weatherQueryPara)
      .then((weatherData) => {
       const dailyWeather= weatherData.body.data.map((weather) => {
         return new Weather(weather);
        });
        res.send(dailyWeather);
      });
  } catch (error) {
    res.status(500).send('internal server error occured');
  }
}

function Weather(weather) {
  this.forecast =  weather.description,
  this.time = weather.valid_date
}

function handleParksReq(params) {
  try {
    const searchQuery = req.query.search_query;
    if (!searchQuery) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://developer.nps.gov/api/v1/parks`
    const parkQueryPara = {
      key: PARK_CODE_API_KEY,
      q : searchQuery,
      limit:'10'
    };
    superagent
      .get(url)
      .query(parkQueryPara)
      .then((parkData) => {
       const parks = parkData.map((park) => {
        return new Park(park);
        });
        res.send(parks);
      });
  } catch (error) {
    res.status(500).send('internal server error occured');
  }
}   

function Park(parkData) {
  this.name= parkData.name;
  this.description = parkData.description;
  this.address = `${parkData.addresses[0].line1}${parkData.addresses[0].city}${parkData.addresses[0].stateCode}${parkData.addresses[0].postalCode}`
  this.fees = parkData.fees[0];
  this.url = parkData.url;
}


cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));

function allError(req, res) {
  res.status(500).send('Sorry, something went wrong');
}

cityApp.use('*', allError);
