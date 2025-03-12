const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;


const loginRouter = require('./login/route');
const { authenticateToken } = require('./middleware');

app.use(express.json());


app.use('/api/login', loginRouter);

const db = new sqlite3.Database('products.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            imageUrl TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('Products table created or already exists');
        }
    });
});

const validateProductFields = (product) => {
    const requiredFields = ['name', 'description', 'price', 'imageUrl'];
    for (let field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
            return `Missing required field: ${field}`;
        }
    }
    
    if (typeof product.name !== 'string') return 'Name must be a string';
    if (typeof product.description !== 'string') return 'Description must be a string';
    if (typeof product.price !== 'number' || isNaN(product.price)) return 'Price must be a valid number';
    if (typeof product.imageUrl !== 'string') return 'ImageUrl must be a string';
    return null;
};


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Product Catalog API' });
});

app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving products:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(rows);
    });
});

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error retrieving product:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(row);
    });
});

app.post('/products', authenticateToken, (req, res) => {
    const newProduct = req.body;
    
    const validationError = validateProductFields(newProduct);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { name, description, price, imageUrl } = newProduct;
    db.run(
        'INSERT INTO products (name, description, price, imageUrl) VALUES (?, ?, ?, ?)',
        [name, description, price, imageUrl],
        function (err) {
            if (err) {
                console.error('Error creating product:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ id: this.lastID, ...newProduct });
        }
    );
});


app.put('/products/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const updatedProduct = req.body;
    const validationError = validateProductFields(updatedProduct);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { name, description, price, imageUrl } = updatedProduct;
    db.run(
        'UPDATE products SET name = ?, description = ?, price = ?, imageUrl = ? WHERE id = ?',
        [name, description, price, imageUrl, id],
        function (err) {
            if (err) {
                console.error('Error updating product:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json({ id, ...updatedProduct });
        }
    );
});


app.delete('/products/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Error deleting product:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(204).send();
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// close the database connection when server stops
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite database:', err.message);
        } else {
            console.log('SQLite database connection closed');
        }
        process.exit(0);
    });
});