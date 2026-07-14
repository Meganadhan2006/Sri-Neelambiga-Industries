const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Service = require('./models/Service');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const services = await Service.find({});
    console.log('Total services in DB:', services.length);
    services.forEach(s => {
      console.log(`Service: ${s.title} | Icon: ${s.icon} | Description: ${s.description}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
