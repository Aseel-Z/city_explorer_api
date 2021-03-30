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
cityApp.use('*', allError);

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
  // handleLocationReq(req, res);
  try {
    let dailyWeather = [];
    const searchQuery = req.query.city;
    if (!searchQuery) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
    const weatherQueryPara = {
      key: WEATHER_CODE_API_KEY,
      lat: newLocation.longitude,
      lon: newLocation.latitude,
      format: 'json',
    };
    superagent
      .get(url)
      .query(weatherQueryPara)
      .then((weatherData) => {
        weatherData.map((element) => {
          let newWeatherForcast = new Weather(
            element.weather.description,
            element.valid_date
          );
          dailyWeather.push(newWeatherForcast);
        });

        res.send(dailyWeather);
      });
  } catch (error) {
    res.status(500).send('internal server error occured');
  }
}

function Weather(weatherInfo, date) {
  this.forecast = weatherInfo;
  this.time = date;
}

function handleParksReq(params) {
  try {
    let parks = [];
    const searchQuery = req.query.city;
    if (!searchQuery) {
      res.status('500').send('Sorry, something went wrong');
    }
    const url = `https://developer.nps.gov/api/v1/parks`
    const parkQueryPara = {
      key: PARK_CODE_API_KEY,
      q : searchQuery + " -H "
     application:'json'
    };
    superagent
      .get(url)
      .query(parkQueryPara)
      .then((parkData) => {
        parkData.map((element) => {
          let newPark = new Park(
            element.name,
            element.address,
            element.fees,
            element.description,
            element.url,
          );
          parks.push(newPark);
        });

        res.send(parks);
      });
  } catch (error) {
    res.status(500).send('internal server error occured');
  }
}   

function Park() {
  this.
  this.
}









cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));

function allError(req, res) {
  res.status(500).send('Sorry, something went wrong');
}
