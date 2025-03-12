const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let products = [];
let nextId = 1;

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

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Product Catalog API' });
});

// Get all products
app.get('/products', (req, res) => {
    res.status(200).json(products);
});

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(product);
});

app.post('/products', (req, res) => {
    const newProduct = req.body;
    
    const validationError = validateProductFields(newProduct);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    
    newProduct.id = nextId;
    products.push(newProduct);
    nextId++;
    
    res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    const updatedProduct = req.body;
    
    const validationError = validateProductFields(updatedProduct);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    updatedProduct.id = id;
    products[productIndex] = updatedProduct;
    
    res.status(200).json(updatedProduct);
});

app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(productIndex, 1);
    res.status(204).send();
});

// Catch-all for unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});