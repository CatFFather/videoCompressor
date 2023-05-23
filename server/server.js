const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
// app.use((_, res, next) => {
//   res.header('Cross-Origin-Opener-Policy', 'same-origin');
//   res.header('Cross-Origin-Embedder-Policy', 'require-corp');
//   next();
// });
app.use(express.static('build'));
const indexRoute = require('./routes/index');
const fileRoute = require('./routes/file');
app.use('/api/', indexRoute);
app.use('/api/file', fileRoute);

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.use((err, req, res, next) => {
  console.error(err.stock);
  res.status(500).send({ success: false, error: err });
});
