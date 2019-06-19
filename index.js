const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const github = require('./lib/github');
const { LOG_TYPE } = require('./lib/constant');

const chalkLogging = (input, type) => {
 const inputBlock = typeof input === 'string' || input instanceof String ? input: JSON.stringify(input, null, 4);
 let logContent;
 switch (type) {
  case LOG_TYPE.SUCCESSS:
    logContent = chalk.green;
    break;
  case LOG_TYPE.ERROR:
    logContent = chalk.red;
    break;
  case LOG_TYPE.WARN:
    logContent = chalk.magenta;
    break;
  case LOG_TYPE.INFO:
    logContent = chalk.blue;
    break;
  case LOG_TYPE.APP:
    logContent = chalk.yellow;
    break; 
  default:
    logContent = chalk.white;
  }
  console.log(logContent(inputBlock));
};

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
      chalkLogging(`Cannot find GitHub user: ${username}`, LOG_TYPE.WARN);
      return null;
    }
  });
  // wait until all promises resolve:
  const validateUsernames = await Promise.all(promises);
  chalkLogging('GitHub users to invite:', LOG_TYPE.INFO);
  chalkLogging(validateUsernames, LOG_TYPE.INFO);
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
      chalkLogging(`Cannot find GitHub org: ${orgName}`, LOG_TYPE.WARN);
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
      chalkLogging(`Successfully invited ${k.login}.`, LOG_TYPE.SUCCESSS);
    } catch (e) {
      chalkLogging(`Cannot invite GitHub user: ${user.login}, ${e}`, LOG_TYPE.WARN);
    }
  }));
  chalkLogging('All users invited.', LOG_TYPE.SUCCESSS);
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
    else chalkLogging('See ya!');
  } catch (e) {
    chalkLogging(e, LOG_TYPE.ERROR);
  }
}

// Start cli:
clear();
chalkLogging(figlet.textSync('GitHub Invitor', { horizontalLayout: 'full' }), LOG_TYPE.APP);
main();
