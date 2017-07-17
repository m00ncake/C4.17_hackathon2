'use strict';
const yelp = require('yelp-fusion');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// Place holders for Yelp Fusion's OAuth 2.0 credentials. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const clientId = 'MllA1nNpcp1kDteVg6OGUw';
const clientSecret = 'h51cl79dh4tsMZFaUompKNZmY6fiZa3KpknZCalOCVXzZeiMY7HeuZ9UUDJKC8WS';

app.use('/activities/:city', getActivityResults);
app.use('/food/:city', getFoodResults);

function getActivityResults(req, res){
    yelp.accessToken(clientId, clientSecret).then(response => {
        const client = yelp.client(response.jsonBody.access_token);

        client.search({
            term: 'Things to do',
            location: req.params.city
        }).then(response => {
            const firstResult = response.jsonBody.businesses;
            const prettyJson = JSON.stringify(firstResult, null, 4);
            console.log(prettyJson);
            res.send(prettyJson);
        });
    }).catch(e => {
        console.log(e);
    });
}

function getFoodResults(req, res){
    yelp.accessToken(clientId, clientSecret).then(response => {
        const client = yelp.client(response.jsonBody.access_token);

        client.search({
            term: 'Food',
            location: req.params.city
        }).then(response => {
            const firstResult = response.jsonBody.businesses;
            const prettyJson = JSON.stringify(firstResult, null, 4);
            console.log(prettyJson);
            res.send(prettyJson);
        });
    }).catch(e => {
        console.log(e);
    });
}

app.listen(3000, function(){
    console.log('Running on port 3000');
});
