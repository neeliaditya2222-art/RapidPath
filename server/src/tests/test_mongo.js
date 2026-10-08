const dns = require('dns');
// Use public Google DNS servers to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');

const uri = 'mongodb+srv://neeli:neeli@mycluster.vdbuzgk.mongodb.net/rapidpath?appName=MyCluster&retryWrites=true&w=majority';

console.log('Testing connection to MongoDB Atlas with Google DNS (8.8.8.8)...');

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log('SUCCESS: Successfully connected to MongoDB Atlas!');
    console.log('Connection state:', mongoose.connection.readyState);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR: Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  });
