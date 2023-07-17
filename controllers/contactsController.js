const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../models/contacts");

const contactsController = {
  listContacts: async (req, res, next) => {
    try {
      const contacts = await listContacts();
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  },

  getContactById: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contact = await getContactById(contactId);
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (error) {
      next(error);
    }
  },

  createContact: async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;
      const newContact = await addContact({ name, email, phone });
      res.status(201).json(newContact);
    } catch (error) {
      next(error);
    }
  },

  removeContact: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contactRemoved = await removeContact(contactId);
      if (contactRemoved) {
        res.status(200).json({ message: "contact deleted" });
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (error) {
      next(error);
    }
  },

  updateContact: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { name, email, phone } = req.body;

      const existingContact = await getContactById(contactId);
      if (!existingContact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      if (!name || !email || !phone) {
        return res.status(400).json({ message: "missing fields" });
      }

      const updatedContact = await updateContact(contactId, {
        name,
        email,
        phone,
      });

      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = contactsController;
