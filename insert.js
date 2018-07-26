const deploymentJSON = {};

function initializeData() {
  function loadJSON(environment, url) {
    $.getJSON(url, function(data) {
      deploymentJSON[environment] = data;
    });
  }

  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    for (let key of Object.keys(items.storedEnvironments)) {
      loadJSON(key, items.storedEnvironments[key]);
    }
  });
}


function modifyExpandedStory(e) {
  function deploymentHTML(environments) {
    return `
      <section class="deployments full">
          <div>
              <h4>Deployed To</h4>
              <div class="deploymentsContainer">
                  ${environments.join(', ')}
              </div>
          </div>
      </section>`;
  }

  function calculateEnvironmentsForStory(storyId) {
    const environments = [];

    for (let environment of Object.keys(deploymentJSON)) {
      if (deploymentJSON[environment][storyId]) {
        environments.push(environment);
      }
    }

    return environments;
  }

  // function calculateEnvironmentsForSha(potentialEnvironments, storyId, sha) {
  //   const environments = [];
  //
  //   for (let environment of potentialEnvironments) {
  //     let shasForStoryInEnvironment = deploymentJSON[environment][storyId];
  //     if (shasForStoryInEnvironment.includes(sha)) {
  //       environments.push(environment);
  //     }
  //   }
  //
  //   return environments;
  // }

  // find the top node
  const storyNode = $(e.target).closest('div.story');

  // if node contains a preview, we are expanding
  if (storyNode.find('.preview').length !== 0) {
    const storyId = storyNode.data('id');

    setTimeout(function(){
      const insertSelector = `.story_${storyId} .code`;
      const deploymentSelector = `.story_${storyId} .deployments`;

      // ensure there is an expanded story and we haven't already marked stuff up
      if($(insertSelector).length !== 0 && $(deploymentSelector).length === 0) {

        setTimeout(initializeData, 3000);

        const environments = calculateEnvironmentsForStory(storyId);

        if (environments.length > 0) {
          // markup story
          $(deploymentHTML(environments)).insertAfter($(insertSelector));

          // markup individual comments (leave broken for now)
          // for (let activity of $(`.story_${storyId} .activity.github`)) {
          //   const activityText = $(activity).text();
          //   const shaRegex = /commit\/([a-z0-9A-Z]+)/;
          //   const sha = shaRegex.exec(activityText)[1];
          //
          //   const commitEnviroments = calculateEnvironmentsForSha(environments, storyId, sha);
          //   if (commitEnviroments.length > 0) {
          //     $(deploymentHTML(commitEnviroments)).insertAfter($(activity).find('.url'));
          //   }
          // }
        }
      }
    }, 10);
  }
}

initializeData();
setInterval(initializeData, 1 * 60 * 1000); // repeat every minute

document.body.addEventListener('click', modifyExpandedStory, true);
document.body.addEventListener('dblclick', modifyExpandedStory, true);
