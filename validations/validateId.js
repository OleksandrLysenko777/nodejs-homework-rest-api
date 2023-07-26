const { isValidObjectId } = require("./isValidObjectId");

const validateId = (req, res, next) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    return res.status(400).json({ message: "Invalid contactId" });
  }
  next();
};

module.exports = validateId;