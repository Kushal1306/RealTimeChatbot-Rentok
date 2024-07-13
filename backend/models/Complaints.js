import mongoose from "mongoose";

const ComplaintsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  category: {
    type: String,
    required: true,
  },
},{timestamps:true});

const Complaints = mongoose.model("Complaints", ComplaintsSchema);

export default Complaints;
