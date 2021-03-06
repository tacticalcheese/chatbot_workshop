'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text) {
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`
    };
  }
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {}

function callSendAPI(sender_psid, response) {
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error('Unable to send message:' + err);
      }
    }
  );
}

let logs = [];

app.post('/webhook', (req, res) => {
  let body = req.body;
  console.log(body);
  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      console.log(webhook_event, 'Sender PSID: ' + sender_psid);
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
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
