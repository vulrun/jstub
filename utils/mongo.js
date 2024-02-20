const mongoose = require("mongoose");

module.exports = {
  mongoose,
  client: mongoose,
  connect,
  model,
};

async function connect(url) {
  try {
    if (!url) throw new Error("mongo url not found");

    mongoose.set("strictQuery", false);

    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("mongo connected");
  } catch (error) {
    console.error("mongo", error);
  }
  return;
}

function model(collection, schema, cb) {
  if (!collection) throw new Error("collection is missing");
  schema = schema || {};

  const DocSchema = new mongoose.Schema(schema, {
    id: false,
    toJSON: { getters: true, virtuals: true },
    strict: !!Object.keys(schema).length,
    timestamps: true,
    versionKey: false,
    collection: collection,
  });

  if (typeof cb === "function") cb(DocSchema);

  return mongoose.model(collection, DocSchema);
}

// async function upsertInDb(data) {
//   try {
//     let defaults = deepCopy(IptvDB());
//     defaults = lo.omit(defaults, ["createdAt", "updatedAt"]);

//     const find = findQueryObj(data, ["member_id", "family_id", "aadhar_id", "voter_id", "dl_no", "pp_no", "pan_no"]);
//     if (lo.isEmpty(find)) throw new Error("UNABLE_TO_FIND_DOC");

//     const doc = await UidaiData.findOne(find, "-_id -createdAt -updatedAt").lean();
//     if (!lo.isEmpty(doc)) {
//       data = extendObj(defaults, doc, data);
//       return UidaiData.updateMany(find, { $set: data });
//     } else {
//       data = extendObj(defaults, data);
//       return UidaiData.insertMany([data]);
//     }
//   } catch (error) {
//     console.error(error);
//   }

//   return;
// }

// const JsonDB = require("../../helpers/JsonDB");
// const jsondb = new JsonDB({ dbFolder: ".trash", dbName: "mobikwik_biller_config_v4" });

// DocSchema.pre(/save|create|update/, async function (next) {
//   try {
//     const newPayload = this.getUpdate().$set;
//     if (newPayload.detailed) {
//       const oldPayload = await this.model.findOne({ matchid: newPayload?.detailed?.matchid }).lean();
//       const newUpdates = difference(newPayload.detailed, oldPayload.detailed, ["updatedAt"]);

//       if (Object.keys(newUpdates).length) {
//         watching.emit("change", { _doc: newPayload, _diff: newUpdates });
//       }

//       if (newPayload?.detailed?.status && newPayload?.detailed?.status.toLowerCase() === "match ended") {
//         this.set("ongoing", false);
//       }
//     }

//     next();
//   } catch (error) {
//     console.error(error);
//   }
// });

// function difference(new1, old1, omit = []) {
//   function changes(new1, old1) {
//     return _.transform(new1, function (result, value, key) {
//       if (!_.isEqual(value, old1[key])) {
//         result[key] = _.isObject(value) && _.isObject(old1[key]) ? changes(value, old1[key]) : value;
//       }
//     });
//   }

//   return changes(_.omit(new1, omit), _.omit(old1, omit));
// }

// module.exports = mongoose.model("CricNext", DocSchema);
// module.exports.watching = () => watching;
