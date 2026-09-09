import mongoose from "mongoose";

const uploadedStudentSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    registrationNo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    cnic: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    session: {
      type: String,
      required: true,
      trim: true,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

uploadedStudentSchema.index(
  {
    universityId: 1,
    cnic: 1,
  },
  {
    unique: true,
  }
);
uploadedStudentSchema.index(
  {
    universityId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

uploadedStudentSchema.index(
  {
    universityId: 1,
    registrationNo: 1,
  },
  {
    unique: true,
  }
);

// For getAllStudents cursor pagination

uploadedStudentSchema.index({
  universityId: 1,
  createdAt: -1,
  _id: -1,
});

// Filtering optimization

uploadedStudentSchema.index({
  universityId: 1,
  session: 1,
});

uploadedStudentSchema.index({
  universityId: 1,
  isActive: 1,
});

export const UploadedStudent = mongoose.model("UploadedStudent", uploadedStudentSchema);
