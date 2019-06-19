const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const github = require('./lib/github');

/**
 * Validate GitHub usernames by getting user info
 * @param {Array} usernameArray the array of input usernames
 */
const validateUsers = async usernameArray => {
  const promises = usernameArray.map(async username => {
    try {
      const userInfo = await github.getUser(username);
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
 * Validate GitHub organization
 * @param {String} orgName the organization name
 */
const validateOrg = async orgName => {
    try {
      const orgInfo = await github.getOrgInfo(orgName);
      return orgInfo.login;
    } catch (e) {
      console.warn(`Cannot find GitHub org: ${orgName}`);
      return null;
    }
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
      const k = await github.postInvite(orgname, user.id);
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

    // validate org:
    const validatedOrg = await validateOrg(orgname);
    if (!validatedOrg) return;

    // validate users:
    const usersArray = usernames.split(',');
    const validateUsernames = await validateUsers(usersArray);

    // invite users:
    const { isConfirmed } = await inquirer.confirmInvite();
    if (isConfirmed) await inviteUsers(validateUsernames, validatedOrg);
    else console.info('See ya!');
  } catch (e) {
    console.error(e);
  }
}

// Start cli:
clear();
console.log(
  chalk.yellow(
    figlet.textSync('GitHub Invitor', { horizontalLayout: 'full' })
  )
);
main();
