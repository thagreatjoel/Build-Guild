let actions = [];

exports.next = (req, res) => {
  actions.push("next");
  res.json({ ok: true });
};

exports.prev = (req, res) => {
  actions.push("prev");
  res.json({ ok: true });
};

exports.status = (req, res) => {
  const action = actions.shift() || null;
  res.json({ action });
};
