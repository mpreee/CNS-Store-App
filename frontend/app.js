const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await fetch('http://localhost:8000/api/accounts/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.access) {
      req.session.token = data.access;
      req.session.username = username;
      const userResp = await fetch('http://localhost:8000/api/accounts/me/', {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });
      const userInfo = await userResp.json();
      req.session.role = userInfo.role;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  } catch (error) {
    res.render('login', { error: 'Backend error' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.token) return res.redirect('/');
  res.render('dashboard', { username: req.session.username, role: req.session.role });
});

app.get('/create-user', (req, res) => {
  if (!req.session.token || req.session.role !== 'ADMIN') return res.redirect('/');
  res.render('create_user', { error: null, message: null });
});

app.post('/create-user', async (req, res) => {
  if (!req.session.token || req.session.role !== 'ADMIN') return res.redirect('/');
  const { username, password, email, role } = req.body;
  try {
    const response = await fetch('http://localhost:8000/api/accounts/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session.token}`
      },
      body: JSON.stringify({ username, password, email, role })
    });
    if (response.ok) {
      res.render('create_user', { error: null, message: 'User created!' });
    } else {
      const err = await response.json();
      res.render('create_user', { error: JSON.stringify(err), message: null });
    }
  } catch (error) {
    res.render('create_user', { error: 'Backend error', message: null });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.listen(3000, () => console.log('Frontend running on http://localhost:3000'));