const pgp = require('pg-promise')();
const connectionString = 'postgres://pokedex:pokedex@localhost:5432/pokedex';
const db = pgp(connectionString);

module.exports = db;
