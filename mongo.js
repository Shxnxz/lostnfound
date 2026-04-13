const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dbuser:lostnfound1@lostnfound.3jwt2lm.mongodb.net/?appName=lostnfound";
const uri2 = "mongodb://dbuser:lostnfound1@ac-ryk1bbx-shard-00-00.3jwt2lm.mongodb.net:27017,ac-ryk1bbx-shard-00-01.3jwt2lm.mongodb.net:27017,ac-ryk1bbx-shard-00-02.3jwt2lm.mongodb.net:27017/?ssl=true&replicaSet=atlas-964jea-shard-0&authSource=admin&appName=lostnfound";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri2, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);