const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Specify the folder where the uploaded images will be stored
      cb(null, '../../uploads');
    },
    filename: (req, file, cb) => {
      // Define the name of the uploaded file (optional: add a timestamp to avoid name conflicts)
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  module.exports = {
    storage
  }