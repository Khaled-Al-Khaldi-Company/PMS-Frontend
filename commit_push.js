const git = require('isomorphic-git');
const fs = require('fs');
const http = require('isomorphic-git/http/node');

async function commitAndPush() {
  const dir = '.';
  try {
    // Add all files
    console.log("Staging files...");
    
    // Simple way: get all file paths that are not ignored
    const files = await git.statusMatrix({ fs, dir });
    
    // The status matrix gives an array of [filepath, HEAD_status, WORKDIR_status, STAGE_status]
    // If WORDIR differs from HEAD or STAGE, it's modified/added/deleted.
    await Promise.all(
      files.map(async (row) => {
        const [filepath, head, workdir, stage] = row;
        // workdir === 0 means deleted
        // workdir === 2 means modified/added
        if (workdir !== head || workdir !== stage) {
          if (workdir === 0) {
            await git.remove({ fs, dir, filepath });
          } else {
            await git.add({ fs, dir, filepath });
          }
        }
      })
    );

    console.log("Committing files...");
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Auto Fix',
        email: 'autofix@example.com',
      },
      message: 'Fix hardcoded API connection strings for Vercel deployment'
    });
    console.log(`Committed with SHA: ${sha}`);

    console.log("Pushing to GitHub...");
    // Force the token in the URL or use onAuth
    // We can get the URL from .git/config
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: 'ghp_k1xd2AhYTLSKZtNvdozyf08KonAZgP0gVmdl' }),
    });
    console.log(pushResult);
    console.log("Push successful!");
  } catch (err) {
    console.error("Error during git operation:", err);
  }
}

commitAndPush();
