const { ObjectId } = require("mongodb");

async function updateManyData(client) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")

    .updateMany(
      { property_type: { $exists: false } },
      { $set: { property_type: "Unknown" } }
    );

  console.log(`Có ${result.matchedCount} tài liệu khớp với tiêu chí truy vấn.`);
  console.log(`Có ${result.modifiedCount} tài liệu đã được cập nhật.`);
}

async function updateOneData(client, collectionName, id, dataUpdate) {
  const collection = client.collection(collectionName);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: dataUpdate }
  );

  if (result) {
    console.log("new Data from Update : ", result);
    return result;
  } else {
    console.log("Đéo có data");
  }

  return result.value;
}

async function updateOneDataAndReturn(client, collectionName, id, dataUpdate) {
  const collection = client.collection(collectionName);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: dataUpdate }
  );

  const resultFinal = await collection.findOne({ _id: new ObjectId(id) });

  if (result) {
    console.log("new Data from Update : ", resultFinal);
    return resultFinal;
  } else {
    console.log("Đéo có data");
  }

  return result.value;
}

// DELETE

async function deleteAll(client) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteMany({});

  console.log(`Đã xóa ${result.deletedCount} bản ghi.`);
}

async function deleteOneData(client, collectionName, id) {
  try {
    const collection = client.collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      console.log(`Delete done`);
      return result
    } else {
      console.log(`Đéo ra data để xóa`);
    }
  } catch (error) {
    console.error("Lỗi khi xóa bản ghi:", error);
  }
}

// FIND
async function findOneName(client, collectionName, Name) {
  try {
    const collection = client.collection(collectionName);

    const result = await collection.findOne({ name: Name });

    if (result) {
      console.log("Yes from findOneName");
      return result;
    } else {
      console.log("No from findOneName");
    }
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function findById(client, collectionName, id) {
  try {
    const collection = client.collection(collectionName);

    const result = await collection.findOne({ _id: new ObjectId(id) });

    if (result) {
      console.log("Yes from findOneById");
      return result;
    } else {
      console.log("No from findOneById");
    }
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function findUserId(client, collectionName, userId1, userId2) {
  try {
    const collection = client.collection(collectionName);

    const result = await collection.findOne({ $or: [{ userX: userId1, userY: userId2 }, { userY: userId1, userX: userId2 }] });

    if (result) {
      console.log("Yes from findOneById");
      return result;
    } else {
      console.log("No from findOneById");
    }
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function findVsManyKey(
  client,
  { name = null, gmail = null, numberResult = Number.MAX_SAFE_INTEGER } = {}
) {
  const collection = client
    .db("sample_airbnb")
    .collection("listingsAndReviews");

  const query = {
    name: { $eq: name },
    mail: { $eq: gmail },
  };

  const sort = { last_review: -1 };

  const limit = numberResult;

  const cursor = collection.find(query).sort(sort).limit(limit);

  const result = await cursor.toArray();

  if (result.length > 0) {
    result.forEach((re) => {
      console.log("new Name:", re);
    });
  } else {
    console.log("Đéo Có Data");
  }
}

// CREATE DATA

async function createManyData(client, Oject) {
  const newData = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertMany(Oject);

  console.log("new data : ", newData);
}

const createOneData = async (db, collectionName, document) => {
  const collection = db.collection(collectionName);

  const result = await collection.insertOne(document);
  console.log(
    `Inserted ${result.insertedCount} documents into ${collectionName}`
  );

  return result;
};

// VIEW DATA
async function viewData(db, collectionName) {
  const collection = db.collection(collectionName);
  const data = await collection.find().toArray();

  return data;
}


module.exports = {
  updateManyData,
  updateOneData,
  updateOneDataAndReturn,
  deleteAll,
  deleteOneData,
  findOneName,
  findById,
  findVsManyKey,
  createManyData,
  createOneData,
  viewData,
  findUserId
};
