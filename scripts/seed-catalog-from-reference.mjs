import { MongoClient } from "mongodb";

const sourceUri = process.env.MONGODB_REFERENCE_URI;
const targetUri = process.env.MONGODB_URI;
const applyChanges = process.argv.includes("--apply");

if (!sourceUri || !targetUri) {
  throw new Error("Set MONGODB_REFERENCE_URI and MONGODB_URI in the environment.");
}

const ADMIN_DB = "fishtokri_admin";
const ADMIN_COLLECTIONS = ["super_hubs", "sub_hubs"];
const HUB_COLLECTIONS = [
  "products",
  "categories",
  "sections",
  "carousels",
  "combos",
  "coupons",
  "pincodes",
  "timeslots",
  "zones",
];

const source = new MongoClient(sourceUri, { serverSelectionTimeoutMS: 15_000 });
const target = new MongoClient(targetUri, { serverSelectionTimeoutMS: 15_000 });

function localCategoryImage(value) {
  const text = String(value ?? "").toLowerCase();
  if (/\b(prawn|prawns|shrimp)\b/.test(text)) return "/categories/prawns.png";
  if (/\b(chicken|egg|poultry)\b/.test(text)) return "/categories/chicken.png";
  if (/\b(mutton|goat|lamb)\b/.test(text)) return "/categories/mutton.png";
  if (/\b(masala|spice|solkadhi)\b/.test(text)) return "/categories/masalas.png";
  return "/categories/fish.png";
}

function prepareDocuments(collectionName, documents) {
  return documents.map((document) => {
    const copy = { ...document };

    if (collectionName === "categories") {
      copy.imageUrl = localCategoryImage(copy.name);
    } else if (collectionName === "products") {
      copy.imageUrl = localCategoryImage(`${copy.category ?? ""} ${copy.name ?? ""}`);
    } else if (collectionName === "carousels") {
      copy.imageUrl = "/banners/fresh-stock-xchange.jpg";
    } else if (collectionName === "combos") {
      copy.imageUrl = "/categories/all.png";
    } else if (collectionName === "timeslots") {
      // The target has no orders yet, so copied slot occupancy must start clear.
      copy.todaysOrderCount = 0;
      copy.nextDayOrderCount = 0;
    }

    return copy;
  });
}

function clusterSignature(hello) {
  return JSON.stringify({
    setName: hello.setName ?? "",
    hosts: [...(hello.hosts ?? [])].sort(),
  });
}

async function collectionDocuments(database, name) {
  const exists = await database.listCollections({ name }, { nameOnly: true }).hasNext();
  return exists ? database.collection(name).find({}).toArray() : [];
}

async function sourceIndexes(database, name) {
  const exists = await database.listCollections({ name }, { nameOnly: true }).hasNext();
  if (!exists) return [];

  const indexes = await database.collection(name).listIndexes().toArray();
  return indexes
    .filter((index) => index.name !== "_id_")
    .map((index) => {
      const options = { name: index.name };
      for (const key of [
        "unique",
        "sparse",
        "expireAfterSeconds",
        "partialFilterExpression",
        "collation",
      ]) {
        if (index[key] !== undefined) options[key] = index[key];
      }
      return { key: index.key, options };
    });
}

async function assertTargetEmpty(database, names) {
  const populated = [];
  for (const name of names) {
    const count = await database.collection(name).countDocuments({});
    if (count > 0) populated.push(`${name}:${count}`);
  }
  if (populated.length) {
    throw new Error(
      `Target is not empty for the collections this import would write (${populated.join(", ")}). No data was changed.`,
    );
  }
}

async function main() {
  await Promise.all([source.connect(), target.connect()]);

  const [sourceHello, targetHello] = await Promise.all([
    source.db("admin").command({ hello: 1 }),
    target.db("admin").command({ hello: 1 }),
  ]);

  if (clusterSignature(sourceHello) === clusterSignature(targetHello)) {
    throw new Error("Reference and target resolve to the same MongoDB cluster; refusing to copy.");
  }

  const sourceAdmin = source.db(ADMIN_DB);
  const targetAdmin = target.db(ADMIN_DB);
  const superHubs = await collectionDocuments(sourceAdmin, "super_hubs");
  const subHubs = await collectionDocuments(sourceAdmin, "sub_hubs");

  if (!superHubs.length || !subHubs.length) {
    throw new Error("Reference database is missing hub configuration; no data was changed.");
  }

  const hubNames = [...new Set(subHubs.map((hub) => hub.dbName))];
  if (
    hubNames.some(
      (name) => typeof name !== "string" || !/^[A-Za-z0-9_-]+$/.test(name),
    )
  ) {
    throw new Error("Reference contains an invalid hub database name; no data was changed.");
  }

  const hubPlans = [];
  for (const dbName of hubNames) {
    const sourceDb = source.db(dbName);
    const targetDb = target.db(dbName);
    const collections = [];

    for (const name of HUB_COLLECTIONS) {
      const documents = await collectionDocuments(sourceDb, name);
      if (!documents.length) continue;
      collections.push({
        name,
        documents: prepareDocuments(name, documents),
        indexes: await sourceIndexes(sourceDb, name),
      });
    }
    hubPlans.push({ dbName, database: targetDb, collections });
  }

  const targetAdminNames = ADMIN_COLLECTIONS;
  const allTargetNames = [
    ...targetAdminNames.map((name) => ({ database: targetAdmin, name })),
    ...hubPlans.flatMap((hub) =>
      hub.collections.map((collection) => ({
        database: hub.database,
        name: collection.name,
      })),
    ),
  ];

  for (const { database, name } of allTargetNames) {
    const count = await database.collection(name).countDocuments({});
    if (count > 0) {
      throw new Error(
        `Target collection ${database.databaseName}.${name} is not empty (${count} documents). No data was changed.`,
      );
    }
  }

  const plan = {
    targetDatabase: ADMIN_DB,
    hubs: hubPlans.map((hub) => ({
      dbName: hub.dbName,
      collections: hub.collections.map(({ name, documents }) => ({
        name,
        documents: documents.length,
      })),
    })),
    adminCollections: {
      super_hubs: superHubs.length,
      sub_hubs: subHubs.length,
    },
    excluded: [
      "users",
      "customers",
      "sessions",
      "orders",
      "couponusages",
      "couponlocationusages",
      "inventory_movements",
      "inventory_adjustments",
      "ftw_inventory_operations",
    ],
    mode: applyChanges ? "apply" : "dry-run",
  };

  console.log(JSON.stringify(plan, null, 2));
  if (!applyChanges) {
    console.log("Dry run only. Re-run with --apply to write the listed records.");
    return;
  }

  for (const hub of hubPlans) {
    for (const collection of hub.collections) {
      for (const index of collection.indexes) {
        await hub.database
          .collection(collection.name)
          .createIndex(index.key, index.options);
      }
    }
  }

  const session = target.startSession();
  try {
    await session.withTransaction(async () => {
      await targetAdmin
        .collection("super_hubs")
        .insertMany(superHubs, { session });
      await targetAdmin
        .collection("sub_hubs")
        .insertMany(subHubs, { session });

      for (const hub of hubPlans) {
        for (const collection of hub.collections) {
          await hub.database
            .collection(collection.name)
            .insertMany(collection.documents, { session });
        }
      }
    });
  } finally {
    await session.endSession();
  }

  const verification = {
    super_hubs: await targetAdmin.collection("super_hubs").countDocuments({}),
    sub_hubs: await targetAdmin.collection("sub_hubs").countDocuments({}),
    hubs: {},
  };

  for (const hub of hubPlans) {
    verification.hubs[hub.dbName] = {};
    for (const collection of hub.collections) {
      verification.hubs[hub.dbName][collection.name] =
        await hub.database.collection(collection.name).countDocuments({});
    }
  }

  console.log("Import committed and verified:");
  console.log(JSON.stringify(verification, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message || "Catalog import failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([source.close(), target.close()]);
  });
