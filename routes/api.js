'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

//connect to database 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (error) => console.log("Database connection error: ", error));
db.on("connected", () => console.log("Connected to database"));

//database structure
const issueSchema = new mongoose.Schema({
  project_name: {type: String, required: true},
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  issue_title: {type: String, required: true },
  issue_text: {type: String, required: true },
  created_by: {type: String, required: true },
  created_on: { type: String, default: Date() },
  updated_on: { type: String, default: Date() }
});

const Issue = mongoose.model("Issue", issueSchema);
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let projectName = req.params.project;
      
    })
    
    .post(function (req, res){
      let projectName = req.params.project;
      
      //NOT all required fields provided
      if (!req.body.issue_title 
        || !req.body.issue_text 
        || !req.body.created_by) {
        
        res.status(500).send({error: 'required field(s) missing'})
        throw new Error('required field(s) missing')
      }
      else {
        let issue = new Issue(req.body);
        findProjectAndAddIssue(projectName, issue, (err, project) => {
          if(err) console.log(err);
          res.send(issue)
        })
      }
    })
    
    .put(function (req, res){
      let projectName = req.params.project;
      
    })
    
    .delete(function (req, res){
      let projectName = req.params.project;
      
    });
    
};
