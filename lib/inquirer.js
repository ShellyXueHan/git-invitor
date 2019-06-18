const inquirer = require('inquirer');

const getInviteInfo = () => {
  const questions = [
    {
      name: 'orgname',
      type: 'input',
      message: 'Enter the GitHub Organization Name:',
      default: 'BCDevOps',
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return 'Please neter the GitHub Organization Name.';
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

module.exports = {
  getInviteInfo,
};
