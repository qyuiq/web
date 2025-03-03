const express = require("express");  
const path = require("path");
const fs = require("fs");

const app = express();  
const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, "products.json");

// app.use(cors());  
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Функция для чтения товаров из файла
const readProductsFromFile = () => {
    if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE);
        return JSON.parse(data);
    } else {
        return [];
    }
};

// Функция для записи товаров в файл
const writeProductsToFile = (products) => {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

// Загружаем товары из файла
let products = readProductsFromFile();

app.get("/products", (req, res) => {
    const { category, sort } = req.query;
    let filteredProducts = [...products];

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    if (sort === "asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    res.json(filteredProducts);
});

app.post("/products", (req, res) => {
    const { name, price, category } = req.body;
    const newProduct = {
        id: products.length + 1,
        name,
        price: Number(price),
        category
    };
    products.push(newProduct);

    // Сохраняем обновленный список товаров в файл
    writeProductsToFile(products);

    res.json(newProduct);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});
