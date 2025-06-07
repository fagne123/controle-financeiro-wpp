const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const apiTokenAuth = require('../middleware/apiTokenAuth');

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private (JWT) or External Service (API Token)
router.post('/',
  (req, res, next) => {
    // Check for API token header and use apiTokenAuth if present
    if (req.header('X-API-Token')) {
      return apiTokenAuth(req, res, next);
    }
    // Otherwise use regular JWT auth
    return authMiddleware(req, res, next);
  },
  require('../middleware/validateTransaction'),
  transactionController.createTransaction
);

// @route   GET api/transactions
// @desc    Get all transactions with optional filtering
// @access  Private
router.get('/', authMiddleware, transactionController.getTransactions);

// @route   GET api/transactions/summary
// @desc    Get spending summary
// @access  Private
router.get('/summary', authMiddleware, transactionController.getSummary);

// @route   GET api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', authMiddleware, transactionController.getTransactionById);

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', authMiddleware, transactionController.updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;
