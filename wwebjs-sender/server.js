const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
app.use(express.json({ limit: '25mb' }));

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '/session' }),
  puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] }
});

let ready = false;
client.on('qr', () => console.log('QR disponível (use docker logs para ver)'));
client.on('ready', () => { ready = true; console.log('✅ WhatsApp pronto'); });
client.on('disconnected', () => { ready = false; console.log('⚠️ Desconectado'); });
client.initialize();

app.get('/qr', (_req, res) => res.json({ info: 'Veja o QR no log: docker logs -f wwebjs-sender' }));

app.post('/send-image', async (req, res) => {
  try {
    if (!ready) return res.status(503).json({ error: 'WhatsApp não está pronto' });
    const { chatIds = [], filePath, caption = '' } = req.body;
    if (!Array.isArray(chatIds) || chatIds.length === 0) return res.status(400).json({ error: 'chatIds vazio' });
    if (!filePath || !fs.existsSync(filePath)) return res.status(400).json({ error: `Arquivo não encontrado: ${filePath}` });

    const media = MessageMedia.fromFilePath(path.resolve(filePath));
    const results = [];
    for (const id of chatIds) {
      const msg = await client.sendMessage(id, media, { caption, sendMediaAsHd: true });
      results.push({ to: id, id: msg.id._serialized });
    }
    res.json({ ok: true, sent: results });
  } catch (err) {
    console.error('Erro no envio:', err?.message || err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`📨 wwebjs-sender em :${PORT}`));
``
