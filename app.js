const express = require('express');
const app = express();
const path = require('path');
const device = require('express-device');
const https = require('https');
const xss = require('xss');

let items = [];
const itemsPath = "https://raw.githubusercontent.com/Connect-To-Care/items/master/items.json";

const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(device.capture());

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    // Jank but Rushil wanted to do this
    if (req.device.type === 'phone') {
        res.render('index_mobile', {
            items,
            layout: false
        });
    } else {
        res.render('index', {
            items,
            layout: false
        });
    }
});

setTimeout(() => update(), 1000 * 60 * 60 * 2);

const update = () => {
    https.get(itemsPath, function (res) {
        let body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            items = JSON.parse(body).map(item => {
                return {
                    name: xss(item.name),
                    img: xss(item.img)
                }
            });
            console.log("Got " + items.length + " items.")
        });
    }).on('error', function (e) {
        console.log("Got an error while grabbing files: ", e);
        process.exit(1);
    });
};

update();
app.listen(3001);

