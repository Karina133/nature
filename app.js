const express = require('express')
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();

// Соединение с базой данных
const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABESE,
    user: process.env.DB_USER,
    password: process.env.PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

app.use(express.json());
// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'));

// Настройка шаблонизатора
app.set('view engine', 'ejs');

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Инициализация сессии
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);

// Middleware
function isAuth(req, res, next) {
    if (req.session.auth) {
        next();
    } else {
        res.redirect('/');
    }
};

/**
 * Маршруты
 */
 app.get("/", async (req, res) => {
    const items = await prisma.item.findMany({
        include: {
            location: true,
        }
    });

    res.render("home", {
        items: items,
    });
});

app.post('/items', (req, res) => {
    let offset = req.body.offset;
    // console.log(offset);
    connection.query("SELECT * FROM items lIMIT 4 OFFSET ?", [[offset]], (err, data, fields) => {
        if (err) {
            console.log('err')
        };
        res.status(200).send(data);
    });
});

app.get("/items/:id", async (req, res) => {
    const { id } = req.params;

    const item = await prisma.item.findFirst({
        where: {
            id: Number(id),
        },
        include: {
            location: true,
            categories: {
                include: {
                    category: true,
                }
            },
        }
    });

    res.render("item", {
        item: (item) ? item : {},
    });
});

app.get('/example-m-n', async (req, res) => {
    await prisma.ItemRelCategory.create({
        data: {
            item_id: Number(2),
            category_id: Number(1),
        }
    });

    res.redirect("/");
});

app.get('/add', isAuth, (req, res) => {
    res.render('add')
})

app.post("/store", async (req, res) => {
    const { title, image } = req.body;

    await prisma.item.create({
        data: {
            title,
            image,
        }
    });

    res.redirect("/");
});


app.post('/delete', (req, res) => {
    connection.query(
        "DELETE FROM items WHERE id=?", [[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.post('/update', (req, res) => {

    connection.query(
        "UPDATE items SET title=?, image=? WHERE id=?", [[req.body.title], [req.body.image], [req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.get('/auth', (req, res) => {
    res.render('auth');

});



app.post('/authh', (req, res) => {
    connection.query(
        "SELECT * FROM users WHERE name=? and password=?",
        [[req.body.name], [req.body.password]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            if (data.length > 0) {
                console.log('auth');
                req.session.auth = true;
            } else {
                console.log('no auth');
            }
            res.redirect('/');
        }
    );
})

app.get('/cat', (req, res) => {
    res.render('cat');

});

app.post('/cat', (req, res) => {
    connection.query(
        "INSERT INTO categories (title,description) VALUES (?, ?)",
        [[req.body.title], [req.body.description]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})


app.get('/categories', (req, res) => {
    connection.query("SELECT * FROM categories",
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.render('categories', {
                categories: data,
            })
        }
    );
})

// app.get('/category-items/:id', (req, res) => {
//     connection.query("SELECT * FROM items WHERE cat_id=?", [[req.params.id]], (err, data, fields) => {
//         if (err) {
//             console.log(err);   
//         }

//         res.render('category-items', {
//             items: data
//         });
//     });
// });

app.post('/catAdd', (req, res) => {
    connection.query(
        "SELECT * FROM items_cat WHERE it_id=? AND cat_id=?", [[req.body.it_id], [req.body.cat_id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            console.log(data);

            if (data.length == 0) {
                connection.query('INSERT INTO items_cat (it_id, cat_id) VALUES (?, ?)', [[req.body.it_id], [req.body.cat_id]], (err, data, fields) => {
                    if (err) {
                        console.log(err);
                    }

                    res.redirect('/');
                });
            } else {
                res.redirect('/');
            }
        }
    );
})