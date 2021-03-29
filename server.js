'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const superagent = require('superagent');

const PORT = process.env.PORT;
const cityApp = express();
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
cityApp.use(cors());

// Path creation
cityApp.get('/location', handleLocationReq);
cityApp.get('/weather', handleWeatherReq);

function handleLocationReq(req, res) {
  const searchQuery = req.query.city;
  if (!searchQuery) {
    res.status(500).send('Sorry, something went wrong')
  }
  const locationData = require('./data/location.json');
  const  newLocation = new Location(searchQuery ,locationData[0]);
  // if (locationData.includes(searchQuery)) {
  // }
  // newLocation = new Error('Sorry, something went wrong');
  res.send(newLocation);
}
function Location(searchQuery, dataLocation) {
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}

function handleWeatherReq(req, res) {
  try {
    let dailyWeather = [];
  const searchQuery = req.query;
  const weatherRawData = require('./data/weather.json');
  const weatherArr = weatherRawData.data;
  weatherArr.map( element => {
    let newWeatherForcast = new Weather(
      element.weather.description,
      element.valid_date
    );
    dailyWeather.push(newWeatherForcast);
  });

  res.send(dailyWeather);
  }
  catch (error) {
 res.status(500).send('internal server error occured')
  }

}

function Weather(weatherInfo, date) {
  this.forecast = weatherInfo;
  this.time = date;
}

cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));
