const express = require('express');
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000;
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgqrjb7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const productCollection = client.db('easyCommerce').collection('product');

        app.get('/product',async(req,res)=>{
            const page=parseInt(req.query.page);
            const size=parseInt(req.query.size);
            const query= {};
            const cursor=productCollection.find(query);
            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
             products =await cursor.limit(10).toArray();

            }
            res.send(products)  
        });

        app.get('/productCount',async(req,res)=>{
            const count = await productCollection.estimatedDocumentCount();
            res.send({count})
        });

        //use post to get products

        app.post('/productByKeys',async(req,res)=>{
            const keys = req.body;
            const ids =keys.map(id => ObjectId(id))
            const query ={_id: {$in: ids}}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray();
            res.send(products)
        });

        app.get('/test',(req,res)=>{
            res.send('test the server')
        })
    }  
    finally{
        
    }
}

run().catch(console.dir)
app.get('/',(req,res) =>{
    res.send('Easy E-commerce is running')
});

app.listen(port, ()=>{
    console.log("Server is running",port)
});
