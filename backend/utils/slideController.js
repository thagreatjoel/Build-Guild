let clients = [];

exports.events = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();
  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
};

function sendEvent(action) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify({ action })}\n\n`);
  });
}

exports.next = (req, res) => {
  sendEvent("next");
  res.json({ ok: true });
};

exports.prev = (req, res) => {
  sendEvent("prev");
  res.json({ ok: true });
};

exports.open = (req, res) => {
  sendEvent("open");
  res.json({ ok: true });
};

exports.viewer = (req, res) => {
  sendEvent("viewer");
  res.json({ ok: true });
};
