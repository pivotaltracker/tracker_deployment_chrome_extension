var deploymentJSON = {};

function initializeData() {
  var environments,
      deferreds = [];

  function loadJSON(enviroment, url) {
    $.getJSON(url, function(data) {
      deploymentJSON[enviroment] = data;
    });
  }

  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    _.each(_.keys(items.storedEnvironments), function(key) {
      loadJSON(key, items.storedEnvironments[key]);
    });
  });
}


function modifyExpandedStory(e) {
  function deploymentHTML(environments) {
    var html = `
        <section class="deployments full">
            <div>
                <h4>Deployed To</h4>
                <div class="deploymentsContainer">
                    ${environments.join(', ')}
                </div>
            </div>
        </section>`;

    return html;
  }

  function calculateEnvironmentsForStory(storyId) {
    var environments = [];

    _.each(_.keys(deploymentJSON), function(environment) {
      if (deploymentJSON[environment][storyId]) {
        environments.push(environment);
      }
    });

    return environments;
  }

  function calculateEnvironmentsForSha(potentialEnvironments, storyId, sha) {
    var enviroments = [];

    _.each(potentialEnvironments, function(environment) {
      var shasForStoryInEnvironment = deploymentJSON[environment][storyId];
      if (_.include(shasForStoryInEnvironment, sha)) {
        enviroments.push(environment);
      }
    });

    return enviroments;
  }

  // find the top node
  var storyNode = $(e.target).closest('div.story');

  // if node contains a preview, we are expanding
  if (storyNode.find('.preview').length !== 0) {
    var storyId = storyNode.data('id');

    setTimeout(function(){
      var insertSelector = `.story_${storyId} .code`,
          deploymentSelector = `.story_${storyId} .deployments`;

      // ensure there is an expanded story and we havent already marked stuff up
      if($(insertSelector).length !== 0 && $(deploymentSelector).length === 0) {

        _.debounce(initializeData, 3000);

        var environments = calculateEnvironmentsForStory(storyId);

        if (environments.length > 0) {
          // markup story
          $(deploymentHTML(environments)).insertAfter($(insertSelector));

          // markup individual comments (leave broken for now)
          _.each($(`.story_${storyId} .activity.github`), function(activity) {
            var activityText = $(activity).text();
            var shaRegex = /commit\/([a-z0-9A-Z]+)/;
            var sha = shaRegex.exec(activityText)[1];

            var commitEnviroments = calculateEnvironmentsForSha(environments, storyId, sha);
            if (commitEnviroments.length > 0) {
              $(deploymentHTML(commitEnviroments)).insertAfter($(activity).find('.url'));
            }
          });
        }
      }
    }, 10);
  }
}

initializeData();
setInterval(initializeData, 1 * 60 * 1000); // repeat every minute

document.body.addEventListener('click', modifyExpandedStory, true);
document.body.addEventListener('dblclick', modifyExpandedStory, true);
