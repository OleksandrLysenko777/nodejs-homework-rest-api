const Joi = require("joi");

function validateContact(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  let schema;

 
  if (req.method === "PATCH") {
    schema = Joi.object({
      favorite: Joi.boolean().required().messages({
        "any.required": `missing field favorite`,
      }),
    });
  } else {
    schema = Joi.object({
      name: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
          "string.pattern.base": `name should contain first name and last name`,
          "any.required": `missing required name field`,
        }),
      email: Joi.string().email().required().messages({
        "string.email": `email should be a valid email`,
        "any.required": `missing required email field`,
      }),
      phone: Joi.string()
        .pattern(
          /^([+][0-9]{0,4})?[\s]?([(][0-9]{1,3}[)])?[\s]?[0-9]{2,3}[-\s]?[0-9]{2,3}[-\s]?[0-9]{2,4}$/
        )
        .required()
        .messages({
          "string.pattern.base": `phone is incorrect`,
          "any.required": `missing required phone field`,
        }),
    });
  }

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
}

module.exports = { validateContact };
