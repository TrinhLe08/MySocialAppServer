const { MongoClient } = require("mongodb");

async function mongoAPI() {
    const uri = 'mongodb+srv://NextServer:trinhle00@atlascluster.giqazxr.mongodb.net/?retryWrites=true&w=majority'

    const client = new MongoClient(uri)
   
    try {
        // await client.connect() 

        // await listData(client)

        await createOneData(client , {
            name : 'Vip',
            gamil: 'vip@gmail.com'
        })
        
        // await createManyData(client,
        //[ 
        //    {
        //     name: 'TrinhLe08',
        //     mail: 'khanhtrinhmc2021@gmail.com'
        //   }, 
        //   {
        //     name : 'King',
        //     mail: 'king@gmail.com'
        //     }
        // ] 
        //)

        // await findVsManyKey(client, {
        //     name : 'TrinhLe08',
        //     mail: 'khanhtrinhmc2021@gmail.com'
        // })

        // await updateData(client, 'TrinhLe08', { name: 'KingVip', mail: 'kingvip@gmail.com' })

        // await deleteOneData(client, 'TrinhLe08')

        // await updateManyData(client)

        // await deleteAll(client)
       

    } catch (err) {
        console.error(err);
    } finally {
        client.close()
    }  
}

// UPDATE 

async function updateManyData(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
    .updateMany(
        { property_type: { $exists: false } },
        { $set: { property_type: "Unknown" } }
    );
 
    console.log(`Có ${result.matchedCount} tài liệu khớp với tiêu chí truy vấn.`);
    console.log(`Có ${result.modifiedCount} tài liệu đã được cập nhật.`);
}

async function updateData(client, nameToUpdate, dataUpdate) {
    const newData = await client.db('sample_airbnb').collection('listingsAndReviews')
    .findOneAndUpdate({name : nameToUpdate}, {$set : dataUpdate})
                                           //, { upsert: true}) ->>  Tạo một bản ghi mới nếu không tìm thấy bản ghi ứng với điều kiện tìm kiếm.

    if (newData) {
     console.log('new Data : ', newData); 
     } else {
         console.log('Đéo có data');
     } 
}

// DELETE

async function deleteAll(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({});

    console.log(`Đã xóa ${result.deletedCount} bản ghi.`);
}

async function deleteOneData(client, nameToDelete) {
    try {
        const result = await client.db('sample_airbnb').collection('listingsAndReviews')
            .deleteOne({ name: nameToDelete });

        if (result.deletedCount > 0) {
            console.log(`Delete '${nameToDelete}'`);
        } else {
            console.log(`Đéo ra data '${nameToDelete}' để xóa`);
        }
    } catch (error) {
        console.error('Lỗi khi xóa bản ghi:', error);
    }
}


// FIND 

async function findOneName(client, Name) {
    try {
        const result = await client.db('sample_airbnb').collection('listingsAndReviews')
            .findOne({ name: Name });

        if (result) {
            console.log('new Name:', result);
        } else {
            console.log('Đéo thấy data ');
        }
    } catch (error) {
        console.error('ERROR', error);
    }
}

async function findVsManyKey(client, {
    name = null,
    gmail = null,
    numberResult = Number.MAX_SAFE_INTEGER
} = {}) {
    const collection = client.db('sample_airbnb').collection('listingsAndReviews');

    const query = {
        name: { $eq: name },
        mail: { $eq: gmail }
    };

    const sort = { last_review: -1 };

    const limit = numberResult;

    const cursor = collection.find(query).sort(sort).limit(limit);

    const result = await cursor.toArray();

    if (result.length > 0) {
        result.forEach(re => {
            console.log('new Name:', re);
        })
    } else {
        console.log('Đéo Có Data');
    }
}


// CREATE DATA 

async function createManyData(client, Oject){
    const newData = await client.db('sample_airbnb').collection('listingsAndReviews').insertMany(Oject)
 
    console.log('new data : ', newData); 
 }

async function createOneData(client, Oject){
   const newData = await client.db('sample_airbnb').collection('listingsAndReviews').insertOne(Oject)

   console.log('new data : ', newData); 
}

mongoAPI().catch(console.error)

async function listData(client) {
    const data = await client.db().admin().listDatabases()
    const dataView = []

    data.databases.forEach((da,num) => {
      dataView.push(da);
    });

    return dataView
}

