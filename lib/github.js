const Octokit = require('@octokit/rest');
require('dotenv').config();

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
  previews: [
    'dazzler-preview'
  ],
});

/**
 * GitHub request helper
 * @param {Function} ghFn the octokit request
 * @param {Object} ghFnParams the request parameters to pass in
 */
const ghHelper = async (ghFn, ghFnParams) => {
  try {
    const res = await ghFn({
      ...ghFnParams,
    });

    const { data } = res;
    if (!data) throw Error('No data returned with the request.');
    return data;
  } catch (err) {
    throw err;
  }
};

const getInstance = () => {
  return octokit;
};

const getGithubToken = () => {
  return process.env.GITHUB_TOKEN;
};

const getUser = username =>
  ghHelper(octokit.users.getByUsername, { username: username });

const listCurrUserMemberships = orgName =>
  ghHelper(octokit.orgs.listMemberships, { org: orgName });

const getOrgInfo = orgName =>
  ghHelper(octokit.orgs.get, { org: orgName });

const postInvite = (orgName, userId) =>
  ghHelper(octokit.orgs.createInvitation, { org: orgName, invitee_id: userId });

module.exports = {
  getInstance,
  getGithubToken,
  getUser,
  listCurrUserMemberships,
  postInvite,
  getOrgInfo,
};
  