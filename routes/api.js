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

// FUNCTIONS
const findProjectByName = (projectName, done) => {
  Issue.find({project_name: projectName}, 
             {project_name: 0, __v: 0}, 
             (err, projectFound) => {
                if (err) console.log("findOne error: ",err);
                done(err, projectFound);
              }
  );
};

const addNewIssue = (issue, done) => {
  //--------ONLY FOR Production
  if(issue.issue_title != 'test1') {
    let newIssue = new Issue(issue)
    console.log(issue)
    newIssue.save((err) => {
      if (err){ 
        console.log("error: could not save issue")
        done(err,null)
        return
      }
      done(null,newIssue)
    })
  }
  else{
    done({error: "cannot add new issue with project name test1"},null)
  }
}
const deleteOneIssue = (projectName, issueId, done) => {
  Issue.deleteOne({"_id": ObjectId(issueId), "project_name": projectName}, (err, res) => {
    if(err) console.log("err:", err)

    if(res.length > 0){
      console.log("Found issue to delete :", res)
      done(null,res)
    }
    else{
      console.log("could not find issue by ID")
      done({error: "could not find issue by ID"},res)
    }
  })
}
const updateIssueById = (projectName, issueId, newValues, done) => {
  Issue.update({"_id": ObjectId(issueId), "project_name": projectName}, newValues, (err, res) => { 
    if(res.length > 0 && !err){
      done(null,res)
    }
    else{
      console.log("could not find issue by ID")
      done(err,res)
    }
  })
}

//API ROUTE CRUD
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let projectName = req.params.project;
      
    })
    
    .post(function (req, res){
      //NOT all required fields provided
      if (!req.body.issue_title 
        || !req.body.issue_text 
        || !req.body.created_by) {
        
        res.status(500).send({error: 'required field(s) missing'})
      }
      else if (!req.params.project){
        res.status(500).send({error: 'required "project name" missing'})
      }
      else {
        let issue = new Issue({project_name: req.params.project,
                               ...req.body});
        addNewIssue(issue, (err, newIssue) => {
          if(err) {
            console.log("POST error addNewIssue: ", err)
            res.send(err)
          }
          else {
            res.send({assigned_to: newIssue.assigned_to,
                      status_text: newIssue.status_text,
                      open: newIssue.open,
                      _id: newIssue._id,
                      issue_title: newIssue.issue_title,
                      issue_text: newIssue.issue_text,
                      created_by: newIssue.created_by,
                      created_on: newIssue.created_on,
                      updated_on: newIssue.updated_on}
                    )
          }
        })
      }
    })
    
    .put(function (req, res){
      let projectName = req.params.project;
      
    })
    
    .delete(function (req, res){
      if( !req.body._id ) {
        res.send({ error: 'missing _id' })
      } 
      else {
        deleteOneIssue(req.params.project, req.body._id, (err, issue) => {
          if(err) {
            console.log(err)
            res.send({ error: 'could not delete', '_id': req.body._id  })
          }
          else {
            res.send({ result: 'successfully deleted', '_id': req.body._id })
          }
        })
      }
    });
    
};
