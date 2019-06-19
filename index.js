const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const { getUser, postInvite } = require('./lib/github');

/**
 * Validate GitHub usernames by getting user info
 * @param {Array} usernameArray the array of input usernames
 */
const validateUsers = async usernameArray => {
  const promises = usernameArray.map(async username => {
    try {
      const userInfo = await getUser(username);
      return {
        login: userInfo.login,
        id: userInfo.id,
      };
    } catch (e) {
      console.warn(`Cannot find GitHub user: ${username}`);
      return null;
    }
  });
  // wait until all promises resolve:
  const validateUsernames = await Promise.all(promises);
  console.info('GitHub users to invite:');
  console.info(validateUsernames);
  return validateUsernames;
};

/**
 * Send invite to each user
 * @param {Array} usernameArray validated users
 * @param {String} orgname name of organization to invite to
 */
const inviteUsers = async (usernameArray, orgname) => {
  const userArray = usernameArray.filter(username => username);
  await Promise.all(userArray.map(async user => {
    try {
      const k = await postInvite(orgname, user.id);
      console.log(`Successfully invited ${k.login}.`);
    } catch (e) {
      console.error(`Cannot invite GitHub user: ${user.login}, ${e}`);
    }
  }));
  console.info('All users invited.');
};

const main = async () => {
  try {
    // promote for input:
    const credentials = await inquirer.getInviteInfo();
    const { orgname, usernames } = credentials;

    // validate users:
    const usersArray = usernames.split(',');
    const validateUsernames = await validateUsers(usersArray);

    // invite users:
    const { isConfirmed } = await inquirer.confirmInvite();
    if (isConfirmed) await inviteUsers(validateUsernames, orgname);
    else console.info('See ya!'); 
  } catch (e) {
    console.error(e);
  }
}

// start cli:
clear();
console.log(
  chalk.yellow(
    figlet.textSync('GitHub Invitor', { horizontalLayout: 'full' })
  )
);
main();