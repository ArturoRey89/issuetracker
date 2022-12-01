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


const findProjectByName = (projectName, done) => {
  Project.findOne( {name: projectName}, (err, projectFound) => {
      if (err) console.log("findOne error",err);
      done(null, projectFound);
    }
  );
};

const findProjectAndAddIssue = (projectName, issue, done) => {
  if(issue.issue_title != 'test1') {//--------ONLY FOR Production
          findProjectByName(projectName, (err, project) => {
            //__append to project__
            if(project.issue_array){
              project.issue_array.push(issue)
              project.save((err) =>  err)
            }
            //__create project__
            if(project == false){
              project = new Project({name: projectName,
                                            issue_array: [issue]})
              project.save((err) => err)
            }
            done(null, project)
          })
        }
  else{
    done(`error: Project (${projectName}) not found`,null)
  }
}