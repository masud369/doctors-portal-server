const express = require('express')
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')
//const readFileSync  = require('fs')
var cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
var bodyParser = require('body-parser');
const port = 5000
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kz5wbn2.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// pass:'doctorsxyz',"doctors"

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.use(express.static('doctors'));
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointment");
  const doctorsCollection = client.db("doctorsPortal").collection("doctors");
    console.log("databse connected properly");
    app.post('/addAppointment', (req,res)=>{
        const appointments = req.body;
        appointmentCollection.insertOne(appointments)
        .then(result=>{
			res.send(result);
            console.log(result);
        })
    })
	
	app.post("/appointmentbyDate",(req,res)=>{
		const id = req.body;
		const email = req.body.email;
		console.log(id.date);
		doctorsCollection.find({email:email})
		.toArray((err,documents)=>{
			const filter = {date:id.date};
			if(documents.length === 0){
				filter.email = email;
			}
			
			appointmentCollection.find(filter)
		.toArray((err,result)=>{
			res.send(result);
			console.log(err)
		})
		})
		
	})
	app.post("/addADoctor",(req,res)=>{
		const file = req.files.file;
		const email = req.body.email;
		const name = req.body.name;
		const filePath = `${__dirname}/doctors/${file.name}`;
		console.log(file,email,name);
			const newImg = file.data; 
			const encImg = newImg.toString('base64');
			const imagef = {
				contentType:file.mimetype,
				size:file.size,
				img:Buffer.from(encImg,'base64'),
			}
			
			doctorsCollection.insertOne({name,email, imagef})
			.then(result =>{
					res.send(result.insertedCount > 0);
				
			})
		
	})
	
	app.post("/usersDshboard",(req,res)=>{
		const email = req.body.email;
		console.log(email)
		doctorsCollection.find({email:email})
		.toArray((err,documents)=>{
			res.send(documents.length > 0)
			
		})
	})
	
	app.get('/getDoctors', (req,res)=>{
		doctorsCollection.find({})
		.toArray((err,documents)=>{
			res.send(documents)
		})
	})
	
	app.get('/myAppointmen', (req,res)=>{
		const email = req.query.email;
		appointmentCollection.find({email})
		.toArray((err,documents)=>{
			res.send(documents)
		})
	})
	
	
	
	
	

});









app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})