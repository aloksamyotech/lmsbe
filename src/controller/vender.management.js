 
import { VenderManagement } from "../models/vendor.management.js";

export const addVenderBook = async (req, res) => {
  const {
    vendorName,
    companyName,
    address, 
    date,
    phoneNumber,
    email,
  } = req.body;

  try {
    console.log("Loading................................");
    console.log("print data", req.body);

    const VenderManagementSchema = new VenderManagement({
      vendorName,
      companyName, 
      date,
      phoneNumber,
      email,
      address,
    });

    const VenderManagementData = await VenderManagementSchema.save();
    console.log(" Vender Management Data", VenderManagementData);
    return res.status(200).send(VenderManagementData);
  } catch (error) {
    console.error("Error in Vender Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getVenderManagement = async (req, res) => {
  try {
    const VenderManagementTable = await VenderManagement.find().populate(
      "user_id",  { active: false },
      { $sort: { _id: -1 } },
       
      null,
      null,
      { strictPopulate: false }
    );
    console.log(" Vender Management Table", VenderManagementTable);
    res.status(200).json({
      status: true,
      message: "Help Support Table successful",
      VenderManagement: VenderManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};
 
export const deleteVender = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Vender ID is required" });
  }

  try {
    const deletedVender = await VenderManagement.findByIdAndDelete(id,  { active: false },
     );
    if (!deletedVender) {
      return res.status(404).json({ message: " Vender not found" });
    }
    res.status(200).json({
      message: " Vender deleted successfully",
      deletedVender,
    });
  } catch (error) {
    console.error("Error deleting Vender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVender = async (req, res) => {
  const { id } = req.params;
  const {
    vendorName,
    companyName,
    address, 
    date,
    phoneNumber,
    email,
  } = req.body;

  try {
    const updatedVender = await VenderManagement.findByIdAndUpdate(
      id,  
      
      {
        vendorName,
        companyName,
        address, 
        date,
        phoneNumber,
        email,
      },
      { new: true }
    );

    if (!updatedVender) {
      return res.status(404).json({ message: "Vender not found" });
    }

    res
      .status(200)
      .json({ message: " Vender updated successfully", updatedVender });
  } catch (error) {
    console.error("Error updatingVender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVenderCount = async (req, res) => {
  try {
    const bookCount = await VenderManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};
