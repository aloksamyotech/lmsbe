import { request } from "express";
import { ContactManagement } from "../models/contact.management.js";
import mongoose from "mongoose";

export const addContact = async (req, res) => {
  const {
    student_id,
    student_Name,
    email,
    mobile_Number,
    select_identity,
    upload_identity,
    register_Date,
  } = req.body;

  try {
    const ContactManagementSchema = new ContactManagement({
      student_id,
      student_Name,
      email,
      mobile_Number,
      select_identity,
      upload_identity,
      register_Date,
    });

    const ContactManagementData = await ContactManagementSchema.save();
    return res.status(200).send(ContactManagementData);
  } catch (error) {
    console.error("Error in Contact Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getContactManagement = async (req, res) => {
  try {
    const ContactManagementTable = await ContactManagement.find().populate(
      { active: false },

      "user_id",
      null,
      null,
      { strictPopulate: false }
    );
    res.status(200).json({
      status: true,
      message: "Help Support Table successful",
      ContactManagement: ContactManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedContact = await ContactManagement.findByIdAndDelete(
      new mongoose.Types.ObjectId(id),
      { active: false }
    );
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res
      .status(200)
      .json({ message: "Contact deleted successfully", deletedContact });
  } catch (error) {
    console.error("Error deleting Contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateContact = async (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    student_Name,
    email,
    mobile_Number,
    select_identity,
    upload_identity,
    register_Date,
  } = req.body;

  try {
    const updatedContact = await ContactManagement.findByIdAndUpdate(
      id,

      {
        student_id,
        student_Name,
        email,
        mobile_Number,
        select_identity,
        upload_identity,
        register_Date,
      },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res
      .status(200)
      .json({ message: "Contact updated successfully", updatedContact });
  } catch (error) {
    console.error("Error updating Contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
