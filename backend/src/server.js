const app = require('./app');
const { connectMongo } = require('./utils/connectMongo');

const port = process.env.PORT || 5000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
