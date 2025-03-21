const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const schema = new Schema(
  {
    user: { type: ObjectId, required: true },
    personalInfo: {
      github: { type: String },
      linkedin: { type: String },
      phone: { type: String },
      address: { type: String },
      website: { type: String },
    },
    summary: {
      type: String,
    },
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        course: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String },
        position: { type: String },
        location: { type: String },
        endDate: { type: Date },
        startDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    skills: [
      {
        name: { type: String },
      },
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        link: { type: String },
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Resume", schema);
