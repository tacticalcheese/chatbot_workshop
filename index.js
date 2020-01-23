'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server,
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

function handleMessage(sender_psid, received_message) {}

function handlePostback(sender_psid, received_postback) {}

function callSendAPI(sender_psid, response) {}

let logs = [];

app.post('/webhook', (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      let sender_psid = webhook_event.sender.id;
      logs.push(sender_psid);
      console.log('Sender PSID: ' + sender_psid);
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = 'titkosjelszo';
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.get('/logs', (req, res) => {
  res.send(logs);
});
