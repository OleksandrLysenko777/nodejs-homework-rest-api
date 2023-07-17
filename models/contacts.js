const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const contactsPath = path.format({
  root: "/ignored",
  dir: "models",
  base: "contacts.json",
});

const listContacts = async () => {
  try {
    const contactsData = await fs.readFile(contactsPath, "utf-8");
    let contacts = JSON.parse(contactsData);

    if (!Array.isArray(contacts)) {
      contacts = [];
    }

    return contacts;
  } catch (error) {
    return [];
  }
};

const getContactById = async (contactId) => {
  try {
    const contactsData = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(contactsData);
    const contact = contacts.find((c) => c.id === contactId);
    return contact;
  } catch (error) {
    throw new Error("Could not get the contact.");
  }
};

const removeContact = async (contactId) => {
  try {
    let isContact = false;
    const contactsData = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(contactsData);

    const updatedContacts = contacts.filter((contact) => {
      if (contact.id === contactId) {
        isContact = true;
      }
      return contact.id !== contactId;
    });

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

    return isContact;
  } catch (error) {
    throw new Error("Could not remove the contact.");
  }
};

const addContact = async (body) => {
  try {
    const contactId = uuidv4();
    const newContact = {
      id: contactId,
      name: body.name,
      email: body.email,
      phone: body.phone,
    };

    let contacts = [];

    try {
      const contactsData = await fs.readFile(contactsPath, "utf-8");
      contacts = JSON.parse(contactsData);
    } catch (error) {}

    const updatedContacts = [...contacts, newContact];

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

    return newContact;
  } catch (error) {
    throw new Error("Could not add the contact.");
  }
};

const updateContact = async (contactId, body) => {
  try {
    let isContact = false;
    const contactsData = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(contactsData);

    const updatedContacts = contacts.map((contact) => {
      if (contact.id === contactId) {
        isContact = true;
        return { ...contact, ...body };
      }
      return contact;
    });

    if (!isContact) {
      return null;
    }

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

    const updatedContact = updatedContacts.find(
      (contact) => contact.id === contactId
    );
    return updatedContact;
  } catch (error) {
    throw new Error("Could not update the contact.");
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
