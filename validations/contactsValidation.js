const Joi = require("joi");

const validateContact = (req, res, next) => {
  const updateSchema = Joi.object({
    name: Joi.string().pattern(/^[A-Za-z\s]+$/).messages({
      "string.pattern.base": `name should contain first name and last name`,
    }),
    email: Joi.string().email().messages({
      "string.email": `email should be a valid email`,
    }),
    phone: Joi.string().pattern(
      /^([+][0-9]{0,4})?[\s]?([(][0-9]{1,3}[)])?[\s]?[0-9]{2,3}[-\s]?[0-9]{2,3}[-\s]?[0-9]{2,4}$/
    ).messages({
      "string.pattern.base": `phone is incorrect`,
    }),
    favorite: Joi.boolean(),
  });

  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = { validateContact };
