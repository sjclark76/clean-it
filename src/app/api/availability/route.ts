// src/app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Added NextRequest
import { MongoClient, ServerApiVersion, UpdateResult } from 'mongodb'; // Added UpdateResult

// Define a type for a time slot (can be shared or redefined here)
interface TimeSlot {
    id: string;
    time: string; // e.g., "09:00 AM"
    available: boolean;
}

// Define a type for a day's availability
interface DayAvailability {
    _id?: any; // Optional: MongoDB will generate this if not provided
    date: string; // e.g., "2023-10-27"
    dayName: string; // e.g., "Friday"
    slots: TimeSlot[];
}

// Connection URI - ensure your MongoDB container is running
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "jessiahs_car_cleaning";
const collectionName = "availabilities";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// It's better to create the client instance inside the handler or use a helper for connection management
// to avoid issues with multiple invocations in serverless environments.
// For simplicity here, we'll keep it outside but manage connection per request.

// --- Mock Data for Seeding (if needed) ---
const MOCK_AVAILABILITY_DATA_TO_SEED: DayAvailability[] = [
    {
        date: "2023-11-15",
        dayName: "Wednesday",
        slots: [
            { id: "1", time: "09:00 AM", available: true },
            { id: "2", time: "10:00 AM", available: false },
            { id: "3", time: "11:00 AM", available: true },
            { id: "4", time: "01:00 PM", available: true },
            { id: "5", time: "02:00 PM", available: false },
        ],
    },
    {
        date: "2023-11-16",
        dayName: "Thursday",
        slots: [
            { id: "6", time: "09:30 AM", available: true },
            { id: "7", time: "10:30 AM", available: true },
            { id: "8", time: "11:30 AM", available: false },
        ],
    },
    {
        date: "2023-11-17",
        dayName: "Friday",
        slots: [
            { id: "9", time: "10:00 AM", available: true },
            { id: "10", time: "11:00 AM", available: true },
            { id: "11", time: "12:00 PM", available: true },
            { id: "12", time: "02:00 PM", available: true },
        ],
    },
];
// --- End Mock Data for Seeding ---

async function getConnectedClient() {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    await client.connect();
    return client;
}

export async function GET() {
    let client: MongoClient | null = null;
    try {
        client = await getConnectedClient();
        console.log("GET: Successfully connected to MongoDB.");

        const db = client.db(dbName);
        const availabilitiesCollection = db.collection<DayAvailability>(collectionName);

        const count = await availabilitiesCollection.countDocuments();
        if (count === 0 && MOCK_AVAILABILITY_DATA_TO_SEED.length > 0) {
            console.log(`GET: Collection '${collectionName}' is empty. Seeding with mock data...`);
            await availabilitiesCollection.insertMany(MOCK_AVAILABILITY_DATA_TO_SEED);
            console.log("GET: Mock data seeded successfully.");
        }

        const availabilities = await availabilitiesCollection.find({}).sort({ date: 1 }).toArray(); // Added sort

        return NextResponse.json(availabilities);

    } catch (error) {
        console.error("GET: Failed to connect to MongoDB or fetch data:", error);
        return NextResponse.json(
            { message: "Failed to retrieve availability data", error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
            console.log("GET: MongoDB connection closed.");
        }
    }
}

export async function POST(request: NextRequest) {
    let client: MongoClient | null = null;
    try {
        const newAvailability: DayAvailability = await request.json();

        if (!newAvailability.date || !newAvailability.dayName || !newAvailability.slots) {
            return NextResponse.json({ message: "Missing required fields (date, dayName, slots)" }, { status: 400 });
        }

        client = await getConnectedClient();
        console.log("POST: Successfully connected to MongoDB.");

        const db = client.db(dbName);
        const availabilitiesCollection = db.collection<DayAvailability>(collectionName);

        const result: UpdateResult = await availabilitiesCollection.updateOne(
            { date: newAvailability.date },
            { $set: { dayName: newAvailability.dayName, slots: newAvailability.slots, date: newAvailability.date } },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            return NextResponse.json({ message: "Availability created successfully", id: result.upsertedId }, { status: 201 });
        } else if (result.modifiedCount > 0) {
            return NextResponse.json({ message: "Availability updated successfully" }, { status: 200 });
        } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
            return NextResponse.json({ message: "Availability already up-to-date" }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Failed to update or create availability, no changes made." }, { status: 400 });
        }

    } catch (error) {
        console.error("POST: Failed to process availability:", error);
        return NextResponse.json(
            { message: "Failed to process availability", error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
            console.log("POST: MongoDB connection closed.");
        }
    }
}