const Contact = require("../models/contactModel");
const { isValidObjectId } = require("../validations/isValidObjectId");

const updateStatusContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    return updatedContact;
  } catch (error) {
    throw new Error("Error updating the contact");
  }
};

const contactsController = {
  listContacts: async (req, res, next) => {
    try {
      const contacts = await Contact.find();
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  },

  getContactById: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contact = await Contact.findById(contactId);
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
      const newContact = await Contact.create({ name, email, phone });
      res.status(201).json(newContact);
    } catch (error) {
      next(error);
    }
  },

  removeContact: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contactRemoved = await Contact.findByIdAndRemove(contactId);
      if (contactRemoved) {
        res.status(200).json({ message: "Contact deleted" });
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

      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        { name, email, phone },
        { new: true }
      );

      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  },
  updateContactFavorite: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const { favorite } = req.body;

      if (!isValidObjectId(contactId)) {
        return res.status(400).json({ message: "Invalid contactId" });
      }

      const existingContact = await Contact.findById(contactId);
      if (!existingContact) {
        return res.status(404).json({ message: "Not found" });
      }

      if (favorite === undefined) {
        return res.status(400).json({ message: "missing field favorite" });
      }

      const updatedContact = await updateStatusContact(contactId, { favorite });

      res.status(200).json(updatedContact);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = contactsController;
