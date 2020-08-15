const express = require('express');
const ejs = require('ejs');
const path = require('path');
const crypto = require('crypto')
const session = require('express-session')
const sqlite3 = require('sqlite3').verbose();

const app = express()
const port = 8080

app.set('view engine', 'ejs')

app.use(express.static('css'))
app.use(express.static('node_modules/vue'))

var sess = {
  secret: 'keyboard cat', //vaihda konffista
  cookie: { maxAge: 120000 } /* 120 sekuntia */
}

if (app.get('env') === 'production') { //vaihda konffauksesta
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) throw err;
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS data (
    username TEXT NOT NULL,
    todos TEXT,
    done TEXT
  );`);
  console.log('Yhdistetty välimuistissa toimivaan tietokantaan. VAIN TESTAUSKÄYTTÖÖN');
});

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/api', function(req, res) {
  res.render('api/help')
})

//Vaihda post
app.get('/api/rekisteroidy', function(req, res) {
  if (req.query.kayttajanimi && req.query.salasana) {
    let kayttajanimi = req.query.kayttajanimi;
    let salasana = crypto.createHash('md5').update(req.query.salasana).digest('hex');

    db.all(`SELECT username FROM users WHERE username IS ?;`, [kayttajanimi], (err, rows) => {
      if (err) throw err;

      if (rows.length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.render('api/rekisteroidy', {
          virhe: 'Käyttäjänimi ei ole saatavilla.'
        })
      } else {
        db.run(`INSERT INTO users (username, password) VALUES(?, ?)`, [kayttajanimi, salasana], function(err) {
          if (err) throw err;
          db.run(`INSERT INTO data (username, todos, done) VALUES(?, ?, ?)`, [kayttajanimi, ['Viikkaa vaatteet','Imuroi autotalli','Maalaa olohuone'].join('_'), ['Pese pyykit'].join('_')], function(err) {
            if (err) throw err;
            console.log(`Uusi käyttäjä on luotu. Hänen ID on: ${this.lastID}`);
          });
        });

        res.setHeader('Content-Type', 'application/json');
        res.render('api/rekisteroidy', {
          virhe: '',
          onnistui: 'Uusi käyttäjä on luotu onnistuneesti.'
        });
      }
    });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.render('api/rekisteroidy', {
      virhe: 'Salasana ja/tai käyttäjänimi on tyhjä.'
    })
  }
});

app.get('/api/tunnistaudu', function(req, res) {
  if (req.query.kayttajanimi && req.query.salasana) {
    let kayttajanimi = req.query.kayttajanimi;
    let salasana = crypto.createHash('md5').update(req.query.salasana).digest('hex');

    db.all(`SELECT username FROM users WHERE username IS ? AND password IS ?;`, [kayttajanimi, salasana], (err, rows) => {
      if (err) throw err;

      if (rows.length > 0) {
        req.session.authenticated = true
        req.session.kayttajanimi = kayttajanimi;
        console.log(`Käyttäjä ${rows[0].username} kirjautui sisään äsken.`); //TODO: Kerro milloin sessiot vanhenevat
        res.setHeader('Content-Type', 'application/json');
        res.render('api/tunnistaudu', {
          real: req.session.id
        })
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.render('api/tunnistaudu', {
          real: ''
        })
      }
    });

  } else {
    res.setHeader('Content-Type', 'application/json');
    res.render('api/rekisteroidy', {
      virhe: 'Salasana ja/tai käyttäjänimi on tyhjä.'
    })
  }
});

app.get('/api/tehtavat', function(req, res) {
  if (req.session.authenticated) {
    console.log(`Palvelimelta haetaan tehtäviä. Hakijana ${req.session.kayttajanimi}`);
    db.all(`SELECT * FROM data WHERE username='${req.session.kayttajanimi}';`, [], (err, rows) => {
      if (err) throw err;

      rows.forEach((row) => {
        console.log(row);
      });
      res.setHeader('Content-Type', 'application/json');
      res.render('api/tehtavat', {
        todos: rows[0].todos,
        done: rows[0].done
      });
    });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.render('api/kirjautumaton');
  }
})

//TODO: botti APIn avulla

app.get('/api/tallenna', function(req, res) {
  let regx = "/[^A-Öa-ö0-9-_ ]/g";
  let done = req.query.done.replace(eval(regx), ''); //suojaa sql-injektiolta
  let todos = req.query.todos.replace(eval(regx), ''); //suojaa sql-injektiolta

  if (req.session.authenticated) {
    console.log(`Palvelimelle tallennetaan tehtäviä. Tallentajana ${req.session.kayttajanimi}`);

    db.run(`UPDATE data SET todos = '${todos}', done = '${done}' WHERE username = '${req.session.kayttajanimi}'`, [], function(err) {
      if (err) throw err;
    });
    res.setHeader('Content-Type', 'application/json');
    res.render('api/tallennettu');
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.render('api/kirjautumaton');
  }
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
