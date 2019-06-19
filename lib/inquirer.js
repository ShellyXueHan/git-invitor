const inquirer = require('inquirer');
require('dotenv').config();

const getInviteInfo = () => {
  const questions = [
    {
      name: 'orgname',
      type: 'input',
      message: 'Enter the GitHub Organization Name:',
      default: process.env.GITHUB_ORG,
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return 'Please enter the GitHub Organization Name.';
        }
      }
    },
    {
      name: 'usernames',
      type: 'input',
      message: 'Enter the GitHub usernames to invite:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please provide GitHub usernames.';
        }
      }
    }
  ];
  return inquirer.prompt(questions);
}

const confirmInvite = () => {
  const questions = [
    {
      name: 'isConfirmed',
      type: 'confirm',
      message: 'Are the above users correct?',
      default: false,
    }
  ];
  return inquirer.prompt(questions);
}

module.exports = {
  getInviteInfo,
  confirmInvite,
};
