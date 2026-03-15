import mongoose from "mongoose";
import { Lab } from "../../shared/modelTypes";
import { LAB_NAMES } from "../../shared/labNames";
import { getLabCapacity } from "../../shared/labSeatConfig";

export type LabDB = Lab<mongoose.Types.ObjectId>;

const LabSchema = new mongoose.Schema<LabDB>(
    {
        name: {
            type: String,
            trim: true,
            default: undefined
        },

        building: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Building",
            required: true
        },

        floor: {
            type: Number,
            required: true
        },

        room: {
            type: String,
            enum: LAB_NAMES,
            required: true
        },

        totalSeats: {
            type: Number,
            required: true,
            default: function (this: any) {
                return getLabCapacity(this.room);
            }
        }
    },
    {
        timestamps: true
    }
);

LabSchema.pre("validate", function () {
    if (!this.name && this.room) {
        this.name = this.room;
    }

    if (!this.totalSeats && this.room) {
        this.totalSeats = getLabCapacity(this.room);
    }
});

LabSchema.index({ name: 1 }, { unique: true, sparse: true });
LabSchema.index({ room: 1 }, { unique: true });
LabSchema.index({ building: 1, floor: 1, room: 1 }, { unique: true });

const Lab = mongoose.model("Lab", LabSchema);
export default Lab;
