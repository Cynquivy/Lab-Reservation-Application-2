import mongoose from "mongoose";
import { Building } from "../../shared/modelTypes";

type BuildingDB =  Building<mongoose.Types.ObjectId>

const BuildingSchema = new mongoose.Schema<BuildingDB>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        floors: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Building = mongoose.model("Building", BuildingSchema);
export default Building;
