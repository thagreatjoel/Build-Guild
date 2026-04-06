let action = null;

function next(req, res) {
  action = "next";
  res.json({ ok: true });
}

function prev(req, res) {
  action = "prev";
  res.json({ ok: true });
}

function status(req, res) {
  res.json({ action });
  action = null; // reset after sending
}

module.exports = {
  next,
  prev,
  status
};
