const Contact = require("../models/contactModel");

const contactsController = {
  listContacts: async (req, res, next) => {
    try {
      const contacts = await Contact.find({ owner: req.user._id });
      res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  },

  getContactById: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contact = await Contact.findOne({
        _id: contactId,
        owner: req.user._id,
      });
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
      const newContact = await Contact.create({
        name,
        email,
        phone,
        owner: req.user._id,
      });
      res.status(201).json(newContact);
    } catch (error) {
      next(error);
    }
  },

  removeContact: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contactRemoved = await Contact.findOneAndRemove({
        _id: contactId,
        owner: req.user._id,
      });
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
      const { favorite, name, email, phone } = req.body;

      const updates = {};

      if (favorite !== undefined) {
        updates.favorite = favorite;
      }
      if (name) {
        updates.name = name;
      }
      if (email) {
        updates.email = email;
      }
      if (phone) {
        updates.phone = phone;
      }

      const updatedContact = await Contact.findOneAndUpdate(
        { _id: contactId, owner: req.user._id },
        updates,
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
};

module.exports = contactsController;
