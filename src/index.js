const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const betRoutes = require('./routes/bet');
const groupBetRoutes = require('./routes/groupBet');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/bet', betRoutes);
app.use('/group_bet', groupBetRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'ConfLoto Backend (Node.js) is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});