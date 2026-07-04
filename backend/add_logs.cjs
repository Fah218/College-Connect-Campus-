const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'controllers/teamController.js');

let code = fs.readFileSync(file, 'utf8');

// Add logs to createTeamRequest
code = code.replace(
  `export const createTeamRequest = async (req, res) => {
  try {
    const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers, status } = req.body;`,
  `export const createTeamRequest = async (req, res) => {
  console.log("=== createTeamRequest TRIGGERED ===");
  console.log("Payload:", req.body);
  try {
    const { hackathonId, createdBy, title, description, rolesNeeded, requiredSkills, preferredExperienceLevel, teamSizeLimit, currentMembers, offlineMembers, status } = req.body;`
);

// Add logs to createJoinRequest
code = code.replace(
  `export const createJoinRequest = async (req, res) => {
  try {
    const { teamRequestId, hackathonId, applicantId, applicantName, applicantSkills, githubLink, portfolioLink, linkedinLink, message, status } = req.body;`,
  `export const createJoinRequest = async (req, res) => {
  console.log("=== createJoinRequest TRIGGERED ===");
  console.log("Payload:", req.body);
  try {
    const { teamRequestId, hackathonId, applicantId, applicantName, applicantSkills, githubLink, portfolioLink, linkedinLink, message, status } = req.body;`
);

// Catch block for createTeamRequest
code = code.replace(
  `    console.error('Error creating team request:', error);
    res.status(500).json({`,
  `    console.error('Error creating team request:', error);
    console.error('Validation errors:', error.errors);
    res.status(500).json({`
);

// Catch block for createJoinRequest
code = code.replace(
  `    console.error('Error creating join request:', error);
    res.status(500).json({`,
  `    console.error('Error creating join request:', error);
    console.error('Validation errors:', error.errors);
    res.status(500).json({`
);

fs.writeFileSync(file, code);
console.log("Added logs to teamController.js");
