const express = require('express');
const ImportController = require('../controllers/ImportController');

const router = express.Router();

// POST /api/import/upload - Upload and process CSV/Excel file
router.post('/upload', ImportController.uploadFile);

// GET /api/import/history - Get import history
router.get('/history', ImportController.getImportHistory);

// GET /api/import/template - Download import template
router.get('/template', ImportController.downloadTemplate);

module.exports = router;