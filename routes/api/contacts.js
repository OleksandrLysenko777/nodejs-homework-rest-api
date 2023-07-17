const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contactsController");
const contactsValidation = require("../../validations/contactsValidation");

router.get("/", contactsController.listContacts);
router.get("/:contactId", contactsController.getContactById);
router.post(
  "/",
  contactsValidation.validateContact,
  contactsController.createContact
);
router.delete("/:contactId", contactsController.removeContact);
router.put(
  "/:contactId",
  contactsValidation.validateContact,
  contactsController.updateContact
);

module.exports = router;
