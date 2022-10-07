const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port =process.env.PORT || 5000;
const app=express();

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
                //0 ---> skip - get 0-10;
                //1 ---> skip 1*10 - get 11-20;
                //2 ---> skip 2*10 - get 21-30;
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
            console.log(keys)
            res.send(products)
        });

        app.get('/testing',(req,res)=>{
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
