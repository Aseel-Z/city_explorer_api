'use strict';
// dotev
require('dotenv').config();

// port

const PORT = process.env.PORT || 3000;

// Depedencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// API Keys 
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_CODE_API_KEY = process.env.WEATHER_CODE_API_KEY;
const PARK_CODE_API_KEY = process.env.PARK_CODE_API_KEY;

// express wireframe - app launch

const cityApp = express();
cityApp.use(cors());



// Path creation
cityApp.get('/location', handleLocationReq);
cityApp.get('/weather', handleWeatherReq);
cityApp.get('/parks', handleParksReq);


// Location Request Handler Function + Constructor Function

function Location(searchQuery, dataLocation) {
    this.search_query = searchQuery;
    this.formatted_query = dataLocation.display_name;
    this.longitude = dataLocation.lon;
    this.latitude = dataLocation.lat;
}

function handleLocationReq(req, res) {
    try {
        const url = `https://us1.locationiq.com/v1/search.php`;
        const searchQuery = req.query.city;
        const locationQueryPara = {
            key: GEO_CODE_API_KEY,
            city: searchQuery,
            format: 'json',
        };
        if (!searchQuery) {
            res.status(500).send('Sorry, something went wrong');
        };

        superagent
            .get(url)
            .query(locationQueryPara)
            .then((locationData) => {
                const newLocation = new Location(searchQuery, locationData.body[0]);
                res.status(200).send(newLocation);
            })
    }
    catch (error) {
        res.status(500).send('Sorry, something went wrong')
    }
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
                res.status(200).send(dailyWeather.slice(0,9));
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
    this.fees = parkData.fees[0]||'0.00';
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