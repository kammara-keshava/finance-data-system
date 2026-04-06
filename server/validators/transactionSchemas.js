const Joi = require('joi');

const transactionFields = {
  amount: Joi.number().positive(),
  type: Joi.string().valid('Income', 'Expense'),
  category: Joi.string().valid(
    'Food',
    'Salary',
    'Rent',
    'Transport',
    'Healthcare',
    'Entertainment',
    'Other'
  ),
  date: Joi.date(),
  description: Joi.string().allow(''),
};

const createTransactionSchema = Joi.object({
  amount: transactionFields.amount.required(),
  type: transactionFields.type.required(),
  category: transactionFields.category.required(),
  date: transactionFields.date.required(),
  description: transactionFields.description,
});

const updateTransactionSchema = Joi.object({
  amount: transactionFields.amount,
  type: transactionFields.type,
  category: transactionFields.category,
  date: transactionFields.date,
  description: transactionFields.description,
}).min(1);

module.exports = { createTransactionSchema, updateTransactionSchema };
