const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get('/', (req, res) => res.render('index'));
app.get('/saved', (req, res) => res.render('saved'));
app.get('/scrape', (req, res) => {
    axios.get('https://www.startribune.com/politics/')
        .then((response) => {
            let results = [];
            const $ = cheerio.load(response.data);
            $('.is-story').each(function (i, element) {
                let result = {};
                result.headline = $(this).children('a.tease-headline').data('linkname');
                result.summary = $(this).parent().children('div.tease-summary').text();
                result.url = $(this).children('a.tease-headline').attr('href');

                results.push(result);
            })
            db.Article.find()
                .then(articles => {
                    const savedArt = articles.filter(article => article.saved);
                    const savedHeadlines = savedArt.map(art => art.headline);

                    results.forEach((result) => {
                        if (result.headline && !savedHeadlines.includes(result.headline)) {
                            db.Article.findOneAndUpdate(
                                {
                                    headline: result.headline,
                                },
                                { saved: false, headline: result.headline, summary: result.summary, url: result.url },
                                { upsert: true })
                                .then(dbArt => res.json(dbArt))
                                .catch(err => res.json(err));
                        }
                    });
                })
                .catch(err => res.json(err));

            res.send('Scrape Complete');
        })
        .catch(err => res.json(err));
});
app.get('/clear', (req, res) => {
    db.Article.remove({}, err => console.log('Articles Removed'))
        .then(didIt => res.json(didIt))
        .catch(err => res.json(err));
});
app.get('/articles', (req, res) => {
    console.log(req.query.saved);
    if (req.query.saved === 'true') {
        db.Article.find({ saved: true })
            .then(dbArt => res.json(dbArt))
            .catch(err => res.json(err));
    } else if (req.query.saved === 'false') {
        db.Article.find({ saved: false })
            .then(dbArt => res.json(dbArt))
            .catch(err => res.json(err));
    }
});
app.get('/notes/:id', (req, res) => {
    db.Note.find({ _headlineId: req.params.id })
        .then(dbArt => {
            console.log(dbArt);
            res.json(dbArt);
        })
        .catch(err => res.json(err));
});
app.post('/articles/:id', (req, res) => {
    db.Note.findByIdAndUpdate(req.params.id, req.body, { upsert: true })
        .then(dbNote => db.Article.findOneAndUpdate(req.params.id, { $set: { note: dbNote._id } }, { new: true }))
        .then(dbArt => res.json(dbArt))
        .catch(err => res.json(err));
})
app.put('/articles/:id', (req, res) => {
    db.Article.findByIdAndUpdate(req.params.id, { $set: { saved: true } })
        .then(dbArt => res.json(dbArt))
        .catch(err => res.json(err));
})
app.delete('/articles/:id', (req, res) => {
    db.Article.findByIdAndDelete(req.params.id, () => {
        console.log(`${req.params.id} Article Deleted`)
    }).then(didIt => res.json(didIt))
        .catch(err => res.json(err));
})
app.post('/notes/', (req, res) => {
    db.Note.create(req.body)
        .then(dbNote => db.Article.findOneAndUpdate(req.body._headlineId, { $set: { note: dbNote._id } }, { new: true }))
        .then(dbArt => res.json(dbNote))
        .catch(err => res.json(err));
})
app.delete('/notes/:id', (req, res) => {
    db.Note.findByIdAndDelete(req.params.id, () => {
        console.log(`${req.params.id} Note Deleted`);
    }).then(didIt => res.json(didIt))
        .catch(err => res.json(err));
})
app.listen(PORT, () => console.log(`App running on port ${PORT}!`));