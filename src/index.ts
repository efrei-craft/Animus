import express from 'express';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test', async (req, res) => {
  const players = await prisma.player.findMany();
  res.send(players);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});