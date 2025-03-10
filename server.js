const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;
const PRODUCTS_FILE = path.join(__dirname, "products.json");

// пользователь
const USER_DATA = {
    username: "admin",
    password: "1234"
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// работа с файлами
const readProductsFromFile = () => {
    if (fs.existsSync(PRODUCTS_FILE)) {
        return JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    }
    return [];
};

// запись в файл
const writeProductsToFile = (products) => {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

// проверяем авторизацию
app.get("/", (req, res) => {
    const loggedUser = req.cookies.user;
    if (!loggedUser || loggedUser !== USER_DATA.username) {
        return res.render("login", { error: null });
    }

    const { category, sort } = req.query;
    let products = readProductsFromFile();

    if (category) {
        products = products.filter(p => p.category === category);
    }
    if (sort === "asc") {
        products.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
        products.sort((a, b) => b.price - a.price);
    }

    res.render("index", { products, username: loggedUser });
});

// вход
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === USER_DATA.username && password === USER_DATA.password) {
        res.cookie("user", username, { httpOnly: true});
        return res.redirect("/");
    }
    res.render("login", { error: "Неверные логин или пароль" });
});

app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect("/");
});


// добавление товара
app.post("/products", (req, res) => {
    const { name, price, category } = req.body;
    const products = readProductsFromFile();
    const newProduct = { id: products.length + 1, name, price: Number(price), category };
    products.push(newProduct);
    writeProductsToFile(products);
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
