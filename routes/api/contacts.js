const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contactsController");
const contactsValidation = require("../../validations/contactsValidation");
const validateId = require("../../validations/validateId");

router.get("/", contactsController.listContacts);
router.get("/:contactId", validateId, contactsController.getContactById);
router.post(
  "/",
  contactsValidation.validateContact,
  contactsController.createContact
);
router.delete("/:contactId", validateId, contactsController.removeContact);
router.put(
  "/:contactId",
  validateId,
  contactsValidation.validateContact,
  contactsController.updateContact
);
router.patch(
  "/:contactId/favorite",
  validateId,
  contactsValidation.validateContact,
  contactsController.updateContact
);
router.patch(
  "/:contactId",
  validateId,
  contactsValidation.validateContact,
  contactsController.updateContact
);
module.exports = router;
