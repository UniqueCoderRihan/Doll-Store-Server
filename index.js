const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middileWare Section
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_KEY}@cluster0.jvqibpv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();

    const galleryCollection = client.db('doll-toy').collection('galleryCollection');
    const dollCollection = client.db('doll-toy').collection('dollCollection');

    // Create Index by Search Text
    const indexKeys = { name: 1, category: 1 };
    const indexOptions = { name: 'nameCategory' };
    const result = await dollCollection.createIndex(indexKeys, indexOptions);

    app.get('/searched/:text', async (req, res) => {
      const searchText = req.params.text;

      const result = await dollCollection.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { category: { $regex: searchText, $options: "i" } },
        ],
      }).toArray();
      res.send(result)
    })


    // galleryCollection 
    app.get('/gallery', async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    })
    // All toy Data
    app.get('/toys', async (req, res) => {
      const limit = 20;
      const result = await dollCollection.find().limit(limit).toArray();
      res.send(result)
    })

    // my toy data
    app.get('/mytoy', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query?.email }
      }
      const limit = 20;
      const result = await dollCollection.find(query).limit(limit).toArray();
      res.send(result)
    })
    // Details 
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const curser = { _id: new ObjectId(id) }
      const result = await dollCollection.findOne(curser);
      res.send(result)
    })
    // update toy
    app.patch('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateToy = req.body;
      const updateDoc = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          details: updateToy.details
        }
      }
      const result = await dollCollection.updateOne(filter, updateDoc)
      res.send(result)
      console.log(updateToy)
    })

    //  Add Data From User
    app.post('/toys', async (req, res) => {
      const item = req.body;
      const result = await dollCollection.insertOne(item);
      res.send(result)
    })
    // Delete Data
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dollCollection.deleteOne(query);
      res.send(result);
    })
    // subCategory
    // BabyDolls
    app.get('/category/baby', async (req, res) => {
      const query = { "category": "BabyDolls" };
      const result = await dollCollection.find(query).toArray();
      res.send(result)
    })
    // barbeDolls
    app.get('/category/barbe', async (req, res) => {
      const query = { "category": "BarbieDolls" };
      const result = await dollCollection.find(query).toArray();
      res.send(result)
    })
    // AmericanDolls
    app.get('/category/AmericanDolls', async (req, res) => {
      const query = { "category": "AmericanDolls" };
      const result = await dollCollection.find(query).toArray();
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Hey Developer!. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Assalamualikom ! My Sever Is Running')
})

app.listen(port, () => {
  console.log('Hey, Developer ! No Pain no gain ', port);
})