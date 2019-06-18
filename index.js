const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const { getUser, postInvite } = require('./lib/github');

const main = async () => {
  try {
    // promote for input:
    const credentials = await inquirer.getInviteInfo();
    const { orgname, usernames } = credentials;
    // validate users:
    const usersArray = usernames.split(',');
    const promises = usersArray.map(async username => {
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
    const validateUsernames = await Promise.all(promises)
    console.info('GitHub users to invite:');
    console.info(validateUsernames);
    // invite users:
    validateUsernames.forEach(user => {
      await postInvite(orgname, user.id);
    });

    console.info('All users invited.');
  } catch (e) {
    console.error(e);
  }
}

clear();
console.log(
  chalk.yellow(
    figlet.textSync('GitHub Invitor', { horizontalLayout: 'full' })
  )
);
main();