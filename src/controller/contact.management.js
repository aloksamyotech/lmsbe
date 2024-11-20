import { request } from "express"; 
import {ContactManagement} from "../models/contact.management.js"
import mongoose from "mongoose";

export const addContact = async (req, res) => {
  const {
    // Admin,  
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    email,
    gender,
    address,
  } = req.body;

  try {
    console.log("Loading................................");
    console.log("print data", req.body);

    const ContactManagementSchema = new ContactManagement({
      // Admin,    
      firstName,
      lastName,
      dateOfBirth,   
      phoneNumber,
      email,
      gender,
      address,
    });

    const ContactManagementData = await ContactManagementSchema.save();
    console.log("Contact Management Data", ContactManagementData);
    return res.status(200).send(ContactManagementData);
  } catch (error) {
    console.error("Error in Contact Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};


export const getContactManagement  = async (req, res) => {
  try {
      const  ContactManagementTable = await  ContactManagement.find().populate(
        "user_id",
        null,
        null,
        { strictPopulate: false }
      );
      console.log("  Contact Management Table",  ContactManagementTable);
      res.status(200).json({
        status: true,
        message: "Help Support Table successful",
          ContactManagement:  ContactManagementTable,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: " Internal server error", error });
    }
};


export const deleteContact = async (req, res) => {
  const { id } = req.params;

  console.log("id", id); 
  try {
    const deletedContact = await ContactManagement.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    console.log("deletedContact", deletedContact);
    
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully", deletedContact });
  } catch (error) {
    console.error("Error deleting Contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateContact = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    dateOfBirth,   
    phoneNumber,
    email,
    gender,
    address,
  } = req.body;

  try {
    const updatedContact = await ContactManagement.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        dateOfBirth,   
        phoneNumber,
        email,
        gender,
        address,
      },
      { new: true } 
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact updated successfully", updatedContact });
  } catch (error) {
    console.error("Error updating Contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

