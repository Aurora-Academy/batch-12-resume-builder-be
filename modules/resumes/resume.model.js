const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const schema = new Schema(
  {
    title: { type: String, required: true },
    user: { type: ObjectId, required: true },
    personalInfo: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      summary: {
        type: String,
      },
      github: { type: String },
      linkedin: { type: String },
      address: { type: String },
      website: { type: String },
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
    experiences: [
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
    status: { type: String, required: true, enum: ["draft", "final"], default: "draft" },
    template: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Resume", schema);
