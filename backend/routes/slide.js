let actions = [];

function next(req, res) {
  actions.push("next");
  res.json({ ok: true });
}

function prev(req, res) {
  actions.push("prev");
  res.json({ ok: true });
}

function status(req, res) {
  const action = actions.shift() || null;
  res.json({ action });
}
