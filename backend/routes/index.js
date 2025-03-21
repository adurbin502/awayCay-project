const express = require('express');
const router = express.Router();

router.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
      'XSRF-Token': "12FsWyDu-qXR_VX1vLXX2eLnjOUhKDSSwbK8"
    });
  });

const apiRouter = require('./api');

router.use('/api', apiRouter);

module.exports = router;
