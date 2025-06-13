// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'jessiahs_car_cleaning';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not set. Using default.');
}
if (!process.env.MONGODB_DB_NAME) {
  console.warn(
    'MONGODB_DB_NAME environment variable is not set. Using default.'
  );
}

function connectClient(): Promise<MongoClient> {
  if (client) {
    return Promise.resolve(client);
  }
  if (!clientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    clientPromise = client.connect().catch((err) => {
      clientPromise = null; // Reset promise on error
      client = null; // Reset client on error
      throw err;
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const connectedClient = await connectClient();
  return connectedClient.db(dbName);
}

// Optional: A function to explicitly close the connection if needed,
// though Next.js serverless functions usually manage connections per request.
export async function closeConnection() {
  if (client && clientPromise) {
    await client.close();
    client = null;
    clientPromise = null;
    console.log('MongoDB connection closed explicitly.');
  }
}
