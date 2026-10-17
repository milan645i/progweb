import express from 'express';
import morgan from 'morgan';
import { MongoClient, ObjectId } from 'mongodb';

process.loadEnvFile();

const host = process.env.HOST;
const port = process.env.PORT;
const databaseName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION;
const mongoUrl = process.env.MONGO_URL;
let contacts;

const app = express();

app.use(morgan('combined'));
app.use(express.json());

app.get('/contacts', async function(req, res) {
    try {
        const results = await contacts.find().toArray();
        res.json(results.map(contact => ({ id: contact._id})));
    } catch (e) {
        console.error(e);
        res.status(500).send('Error retrieving contacts');
    }
});

app.get('/contacts/:id', async function(req, res) {
    try {
        const contactId = req.params.id;
        const contact = await contacts.findOne({ _id: new ObjectId(contactId) });
        if (contact) {
            res.json({ id: contact._id, name: contact.name, age: contact.age });
        } else {
            res.status(404).send('Contact not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error retrieving contact');
    }
});

app.post('/contacts', async function(req, res) {
    try {
        const { name, age } = req.body;
        const result = await contacts.insertOne({ name, age });
        res.status(201).json({ id: result.insertedId, name: name, age: age });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error creating contact');
    }
});

app.put('/contacts/:id', async function(req, res) {
    try {
        const contactId = req.params.id;
        const { name, age } = req.body;
        const result = await contacts.updateOne(
            { _id: new ObjectId(contactId) },
            { $set: { name, age } }
        );
        if (result.matchedCount > 0) {
            res.json({ id: contactId, name: name, age: age });
        } else {
            res.status(404).send('Contact not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error updating contact');
    }
});

app.delete('/contacts/:id', async function(req, res) {
    try {
        const contactId = req.params.id;
        const result = await contacts.deleteOne({ _id: new ObjectId(contactId) });
        if (result.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Contact not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error deleting contact');
    }
});

app.use((req, res) => res.status(404).send('Route introuvable'));

async function main() {
    let connection;
    try {
        console.log('Trying to connect...')
        const client = new MongoClient(mongoUrl);
        connection = await client.connect();
        console.log("Successfully connected to MongoDB.");
        const db = connection.db(databaseName);
        contacts = db.collection(collectionName);
        app.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    } catch (e) {
        console.error(e)
    }
}

main();
