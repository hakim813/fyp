const express = require('express');
const Tesseract = require('tesseract.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Temp folder for uploaded images

const app = express();

// Body parser middleware (to parse JSON in POST requests)
app.use(express.json());

// OCR endpoint
app.post('/ocr', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => console.log(m),  // Log OCR progress
  })
    .then(({ data: { text } }) => {
      res.json({ text });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});