// functions/api.js
const { Router } = require('@netlify/functions');
const express = require('express');

const app = express();
const router = Router();

app.use('/.netlify/functions/api', router);

// Add your API routes
router.get('/home', (req, res) => {
  res.json({ message: 'Hello from the API' });
});

module.exports.handler = app;
