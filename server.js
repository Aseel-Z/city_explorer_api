'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT;
const cityApp = express();
cityApp.use(cors());

// Path creation
cityApp.get('/loaction', handleLocationReq);
cityApp.get('/weather', handleWeatherReq);

function handleLocationReq(req, res) {
  let newLocation;
  const searchQuery = req.query;
  const locationData = require('data/location.json');
  console.log(locationData);
  if (locationData.includes(searchQuery)) {
    newLocation = new Location(locationData[0]);
  }
 newLocation = new Error('Sorry, something went wrong')
  res.send(newLocation);
}
function Location(dataLocation) {
  this.search_query = searchQuery;
  this.formatted_query = dataLocation.display_name;
  this.longitude = dataLocation.lon;
  this.latitude = dataLocation.lat;
}

function handleWeatherReq(req, res) {
  let dailyWeather = [];
  const searchQuery = req.query;
  const weatherData = require('data/weather.json');
  weatherData.forEach((element) => {
    let newWeatherForcast = new Weather(element);
    dailyWeather.push(newWeatherForcast);
    res.send(dailyWeather);
  });
}

function Weather(weatherData) {
  this.forecast = weatherData.description;
  this.time = weatherData.datetime;
}

cityApp.listen(PORT, () => console.log(`Listening to Port ${PORT}`));
