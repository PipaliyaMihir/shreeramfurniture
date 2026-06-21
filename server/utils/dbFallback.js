const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function generateObjectId() {
  let hex = '';
  for (let i = 0; i < 24; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

function getFilePath(collectionName) {
  return path.join(dataDir, `${collectionName.toLowerCase()}.json`);
}

function readJSON(collectionName, defaultData = []) {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    const healedDefaultData = Array.isArray(defaultData)
      ? defaultData.map(item => {
          if (!item._id && !item.id) {
            return {
              _id: generateObjectId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...item
            };
          }
          return item;
        })
      : defaultData;
    fs.writeFileSync(filePath, JSON.stringify(healedDefaultData, null, 2));
    return healedDefaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Self-healing check: ensure every item has a valid _id and dates
    if (Array.isArray(parsed)) {
      let modified = false;
      parsed.forEach(item => {
        if (!item._id && !item.id) {
          item._id = generateObjectId();
          if (!item.createdAt) item.createdAt = new Date().toISOString();
          if (!item.updatedAt) item.updatedAt = new Date().toISOString();
          modified = true;
        }
        if (collectionName === 'User' && item.email === 'admin@shreeramfurniture.com' && item._id !== '60c72b2f9b1d8a23c4d5e6f7') {
          item._id = '60c72b2f9b1d8a23c4d5e6f7';
          modified = true;
        }
      });
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
      }
    }
    
    return parsed;
  } catch (e) {
    console.error(`❌ Error in readJSON for ${collectionName}:`, e);
    return defaultData;
  }
}

function writeJSON(collectionName, data) {
  const filePath = getFilePath(collectionName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

class LocalQuery {
  constructor(data) {
    this.data = data;
  }
  sort(options) {
    if (options && typeof options === 'object') {
      const keys = Object.keys(options);
      if (keys.length > 0) {
        const key = keys[0];
        const dir = options[key] === -1 || options[key] === 'desc' || options[key] === 'descending' ? -1 : 1;
        this.data.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA < valB) return dir * -1;
          if (valA > valB) return dir * 1;
          return 0;
        });
      }
    }
    return this;
  }
  skip(n) {
    this.data = this.data.slice(Number(n) || 0);
    return this;
  }
  limit(n) {
    this.data = this.data.slice(0, Number(n) || this.data.length);
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

function wrapModel(mongooseModel, collectionName, defaultData = []) {
  const handler = {
    get(target, prop, receiver) {
      const isOnline = mongoose.connection.readyState === 1;

      // When database is online, use normal mongoose behavior
      if (isOnline) {
        return Reflect.get(target, prop, receiver);
      }

      // If database is offline, fallback to local JSON database storage
      console.log(`⚠️ Database is offline. Intercepting '${collectionName}.${prop}' using local JSON database.`);

      if (prop === 'find') {
        return function (query = {}) {
          const list = readJSON(collectionName, defaultData);
          const filtered = list.filter(item => {
            for (let key in query) {
              // Custom matching for nested subdocument search
              if (key === 'categories.name') {
                const targetCat = query[key];
                if (Array.isArray(item.categories)) {
                  const match = item.categories.some(c => (typeof c === 'string' ? c : c.name) === targetCat);
                  if (!match) return false;
                } else {
                  return false;
                }
              } else if (key === 'active') {
                if (item.active !== query[key]) return false;
              } else if (query[key] && typeof query[key] === 'object' && query[key].$regex) {
                const regex = new RegExp(query[key].$regex, query[key].$options || 'i');
                if (!regex.test(item[key])) return false;
              } else if (item[key] !== query[key]) {
                return false;
              }
            }
            return true;
          });
          return new LocalQuery(filtered);
        };
      }

      if (prop === 'findOne') {
        return function (query = {}) {
          const list = readJSON(collectionName, defaultData);
          const item = list.find(item => {
            for (let key in query) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
          if (item) {
            // Re-instantiate schema methods (like password verification)
            if (collectionName === 'User' && item.password) {
              item.matchPassword = async function (entered) {
                if (entered === this.password) return true;
                return await bcrypt.compare(entered, this.password);
              };
            }
          }
          const promise = Promise.resolve(item || null);
          promise.select = function() { return promise; };
          return promise;
        };
      }

      if (prop === 'findById') {
        return function (id) {
          const list = readJSON(collectionName, defaultData);
          const item = list.find(item => String(item._id || item.id) === String(id));
          const promise = Promise.resolve(item || null);
          promise.select = function() { return promise; };
          return promise;
        };
      }

      if (prop === 'countDocuments') {
        return function (query = {}) {
          const list = readJSON(collectionName, defaultData);
          const filtered = list.filter(item => {
            for (let key in query) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
          return Promise.resolve(filtered.length);
        };
      }

      if (prop === 'create') {
        return function (doc) {
          const list = readJSON(collectionName, defaultData);
          const newDoc = {
            _id: generateObjectId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...doc
          };
          if (collectionName === 'User' && newDoc.password) {
            const salt = bcrypt.genSaltSync(10);
            newDoc.password = bcrypt.hashSync(newDoc.password, salt);
          }
          list.push(newDoc);
          writeJSON(collectionName, list);
          return Promise.resolve(newDoc);
        };
      }

      if (prop === 'findByIdAndUpdate') {
        return function (id, update, options = {}) {
          const list = readJSON(collectionName, defaultData);
          const index = list.findIndex(item => String(item._id || item.id) === String(id));
          if (index === -1) return Promise.resolve(null);
          const updatedDoc = {
            ...list[index],
            ...update,
            updatedAt: new Date().toISOString()
          };
          list[index] = updatedDoc;
          writeJSON(collectionName, list);
          return Promise.resolve(updatedDoc);
        };
      }

      if (prop === 'findByIdAndDelete') {
        return function (id) {
          const list = readJSON(collectionName, defaultData);
          const index = list.findIndex(item => String(item._id || item.id) === String(id));
          if (index === -1) return Promise.resolve(null);
          const deleted = list.splice(index, 1)[0];
          writeJSON(collectionName, list);
          return Promise.resolve(deleted);
        };
      }

      if (prop === 'deleteMany') {
        return function (query = {}) {
          if (Object.keys(query).length === 0) {
            writeJSON(collectionName, []);
            return Promise.resolve({ deletedCount: 0 });
          }
          const list = readJSON(collectionName, defaultData);
          const originalLength = list.length;
          const kept = list.filter(item => {
            for (let key in query) {
              if (item[key] === query[key]) return false;
            }
            return true;
          });
          writeJSON(collectionName, kept);
          return Promise.resolve({ deletedCount: originalLength - kept.length });
        };
      }

      if (prop === 'insertMany') {
        return function (docs) {
          const list = readJSON(collectionName, defaultData);
          const newDocs = docs.map(doc => ({
            _id: generateObjectId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...doc
          }));
          list.push(...newDocs);
          writeJSON(collectionName, list);
          return Promise.resolve(newDocs);
        };
      }

      return Reflect.get(target, prop, receiver);
    }
  };

  return new Proxy(mongooseModel, handler);
}

module.exports = { wrapModel };
