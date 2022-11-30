'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

//connect to database 
const db = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
db.on("error", (error) => console.log("Database connection error: ", error));
db.on("connected", () => console.log("Connected to database"));

//database structure
const issueSchema = new mongoose.Schema({
  issue_title: {type: String, required: true },
  issue_text: {type: String, required: true },
  created_on: { type: String, default: Date() },
  updated_on: { type: String, default: Date() },
  created_by: {type: String, required: true },
  assigned_to: { type: String, default: "" },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: "" }
});
const projectSchema = new mongoose.Schema({
  project_name: String,
  project_issue_tracker: [issueSchema]
});

const Project = mongoose.model("Project", projectSchema);
const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
