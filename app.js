// Import necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const cors = require('cors'); // Import cors

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login and generate JWT
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.one('SELECT * FROM users WHERE username = $1', [username]);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get information about a specific Pokémon by ID
app.get('/pokemon/:id', async (req, res) => {
    const pokemonId = parseInt(req.params.id);

    try {
        const pokemon = await db.one('SELECT * FROM pokemon WHERE pokedex_number = $1', [pokemonId]);
        res.json(pokemon);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Pokémon not found' });
    }
});

// Get information about all Pokémon
app.get('/pokemon', async (req, res) => {
    try {
        const allPokemon = await db.any('SELECT * FROM pokemon');
        res.json(allPokemon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
