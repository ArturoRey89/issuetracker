"use strict";
require("dotenv").config();
const mongoose = require("mongoose");

//connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.log("Database connection error: ", error));
db.on("connected", () => console.log("Connected to database"));

//database structure
const issueSchema = new mongoose.Schema({
  project_name: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: String, default: Date() },
  updated_on: { type: String, default: Date() },
});

const Issue = mongoose.model("Issue", issueSchema);
const ObjectId = mongoose.Types.ObjectId;

//############ FUNCTIONS ####################
const findProjectByName = (projectName, filter, done) => {
  Issue.find(
    { project_name: projectName, ...filter },
    { project_name: 0, __v: 0 },
    (err, projectFound) => {
      if (err)
      done(err, null);
      
        return console.log(
          "findOne error, projectName: ",
          projectName,
          "filter",
          filter
        );
      done(err, projectFound);
    }
  );
};

const addNewIssue = (issue, done) => {
  let newIssue = new Issue(issue);
  newIssue.save((err) => {
    if (err) {
      done(err, null);
      return;
    }
    done(null, newIssue);
  });
};

const deleteOneIssue = (projectName, issueId, done) => {
  try {
    Issue.findOneAndDelete(
      { _id: ObjectId(issueId), project_name: projectName },
      (err, res) => {
        if (err) console.log("deleteOne error with _id:", issueId, "res:", res);
        done(err, res);
      }
    );
  } catch (e) {
    done(e, null);
  }
};

const updateIssueById = (projectName, issueId, newValues, done) => {
  try {
    Issue.findOneAndUpdate(
      { _id: ObjectId(issueId), project_name: projectName },
      { updated_on: new Date(), ...newValues },
      (err, res) => {
        if (err)
          console.log(
            "updateOne error with _id: ",
            issueId,
            " and projectName: ",
            projectName
          );
        done(err, res);
      }
    );
  } catch (e) {
    done(e, null);
  }
};

//########### API REQUESTS ###############
module.exports = function (app) {
  app
    .route("/api/issues/:project")

    //########  GET  ########
    .get(function (req, res) {
      findProjectByName(req.params.project, req.query, (err, project) => {
        if (err) {
          res.send({ error: "COULD NOT FIND PROJECT" });
        } else if (project.length > 0) {
          res.json(project);
        } else {
          res.send({ error: "COULD NOT FIND PROJECT" });
        }
      });
    })

    //########  POST  ########
    .post(function (req, res) {
      //NOT all required fields provided
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        res.status(500).send({ error: "required field(s) missing" });
      } else if (!req.params.project) {
        res.status(500).send({ error: 'required "project name" missing' });
      } else {
        let issue = new Issue({
          project_name: req.params.project,
          ...req.body,
        });
        addNewIssue(issue, (err, newIssue) => {
          if (err) {
            res.send({ error: "POST error on addNewIssue" });
          } else {
            res.send({
              assigned_to: newIssue.assigned_to,
              status_text: newIssue.status_text,
              open: newIssue.open,
              _id: newIssue._id,
              issue_title: newIssue.issue_title,
              issue_text: newIssue.issue_text,
              created_by: newIssue.created_by,
              created_on: newIssue.created_on,
              updated_on: newIssue.updated_on,
            });
          }
        });
      }
    })

    //########  PUT  ########
    .put(function (req, res) {
      let input_array = Object.entries(req.body).filter((val, key) => {
        return typeof val[1] == "boolean" || val[1];
      });
      if (!req.body._id) {
        res.send({ error: "missing _id" });
      } else if (input_array.length < 2) {
        res.send({ error: "no update field(s) sent", _id: req.body._id });
      } else {
        updateIssueById(
          req.params.project,
          req.body._id,
          Object.fromEntries(input_array),
          (err, updatedIssue) => {
            if (err) {
              res.send({ error: "could not update", _id: req.body._id });
            } else if (updatedIssue) {
              res.send({ result: "successfully updated", _id: req.body._id });
            } else {
              res.send({ error: "could not update", _id: req.body._id });
            }
          }
        );
      }
    })

    //########  DELETE  ########
    .delete(function (req, res) {
      if (!req.body._id) {
        res.send({ error: "missing _id" });
      } else {
        deleteOneIssue(
          req.params.project,
          req.body._id,
          (err, deletedIssue) => {
            if (err) {
              res.send({ error: "could not delete", _id: req.body._id });
            } else if (deletedIssue) {
              res.send({ result: "successfully deleted", _id: req.body._id });
            } else {
              res.send({ error: "could not delete", _id: req.body._id });
            }
          }
        );
      }
    });
};
