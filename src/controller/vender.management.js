// import { VenderManagement } from "../models/book.management.js";
import { VenderManagement } from "../models/vender.management.js";

export const  addVenderBook = async (req, res) => {
  const { 
    companyName, 
    address,  
    cityName,  
    date, 
    phoneNumber, 
    email, 
  } = req.body;

  try {
    console.log("Loading................................");
    console.log("print data", req.body);

    const VenderManagementSchema = new VenderManagement({
    companyName, 
    cityName,  
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


export const  getVenderManagement  = async (req, res) => {
    try {
        const  VenderManagementTable = await VenderManagement.find().populate(
          "user_id",
          null,
          null,
          { strictPopulate: false }
        );
        console.log(" Vender Management Table",  VenderManagementTable);
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

  try {
    const deletedVender = await VenderManagement.findByIdAndDelete(id);
    if (!deletedVender) {
      return res.status(404).json({ message: "Vender not found" });
    }
    res.status(200).json({ message: "Vender deleted successfully" });
  } catch (error) {
    console.error("Error deleting Vender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVender = async (req, res) => {
  const { id } = req.params;
  const {
    companyName, 
    address,  
    cityName,  
    date, 
    phoneNumber, 
    email,
  } = req.body;

  try {
    const updatedVender = await VenderManagement.findByIdAndUpdate(
      id,
      {
        companyName, 
        address,  
        cityName,  
        date, 
        phoneNumber, 
        email,
      },
      { new: true } 
    );

    if (!updatedVender) {
      return res.status(404).json({ message: "Vender not found" });
    }

    res.status(200).json({ message: " Vender updated successfully", updatedVender });
  } catch (error) {
    console.error("Error updatingVender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
