const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});
const runBackend = () => {
	//Mongo connection
	try {
		client
			.connect()
			.then(() => console.log("Database connection established"));
		const collection = client.db("nodeMongoDb").collection("users");

		app.post("/api/addUser", (req, res) => {
			const user = req.body;
			collection.insertOne(user).then((result) => {
				if (result?.acknowledged) res.redirect("/");
			});
		});
		app.get("/users", (req, res) => {
			collection
				.find({})
				.toArray()
				.then((result) => {
					res.send(result);
				});
		});
		app.get("/showUsers", (req, res) => {
			res.sendFile(__dirname + "/user.html");
		});

		app.get("/user/:id", (req, res) => {
			collection
				.findOne({ _id: new ObjectId(req.params.id) })

				.then((result) => res.send(result));
		});

		app.patch("/userUpdate/:id", (req, res) => {
			collection
				.updateOne({ _id: new ObjectId(req.params.id) }, [
					{ $set: req.body },
				])
				.then((result) => {
					res.send(result.acknowledged);
				});
		});

		app.delete("/userDelete/:id", (req, res) => {
			collection
				.deleteOne({ _id: new ObjectId(req.params.id) })
				.then((result) => res.send(result.deletedCount > 0));
		});
	} catch (err) {
		console.error(err);
	} finally {
		app.listen(5000, (req, res) => {
			console.log("listening on port 5000");
		});
	}
};
runBackend();
