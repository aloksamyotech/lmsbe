 
import { PublicationsManagement } from "../models/publications.management.js";

export const addPublications = async (req, res) => {
  const { 
    publisherName, 
    address,
    description,
  } = req.body;

  try {
    const PublicationsManagementSchema = new PublicationsManagement({
      publisherName, 
      address, 
      description,
    });

    const PublicationsManagementData =
      await PublicationsManagementSchema.save(); 
    return res.status(200).send(PublicationsManagementData);
  } catch (error) {
    console.log(" PublicationsManagement Error", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getPublications = async (req, res) => {
  try {
    const PublicationsManagementTable =
      await PublicationsManagement.find().populate("user_id", null, null, {   active: false ,
         $sort: { _id: -1 } ,
        strictPopulate: false,
      }); 
    res.status(200).json({
      status: true,
      message: " Publication Management Table successful",
      PublicationsManagement: PublicationsManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deletePublications = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Publication ID is required" });
  }

  try {
    const deletedPublications =
      await PublicationsManagement.findByIdAndDelete(id,  { active: false },
        );
    if (!deletedPublications) {
      return res.status(404).json({ message: "Publication not found" });
    }
    res.status(200).json({
      message: "Publication deleted successfully",
      deletedPublications,
    });
  } catch (error) {
    console.error("Error deleting publication:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editPublications = async (req, res) => {
  const { id } = req.params;
  const {
    publisherName,
    bookName,
    title,
    author,
    address, 
    description,
  } = req.body;

  try {
    const updatedPublications = await PublicationsManagement.findByIdAndUpdate(
      id,  
      {
        publisherName,
        bookName,
        title,
        author,
        address, 
        description,
      },
      { new: true }
    );

    if (!updatedPublications) {
      return res.status(404).json({ message: "Publication not found" });
    }

    res.status(200).json({
      message: "Publication updated successfully",
      updatedPublications,
    });
  } catch (error) {
    console.error("Error updating Publications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPublicationsCount = async (req, res) => {
  try {
    const bookCount = await PublicationsManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};

 