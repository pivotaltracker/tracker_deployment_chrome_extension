function save_options() {
  var form = $('#deploy_spy_configuration'),
      tmpEnvironments = {};

  _.each(form.serializeArray(), function(input){
    var index = input.name.split("_")[1];
    if (!tmpEnvironments[index]) {
      tmpEnvironments[index] = {};
    }

    if (input.name.match("name")) {
      tmpEnvironments[index].name = input.value;
    } else if (input.name.match("url")) {
      tmpEnvironments[index].url = input.value;
    }
  });

  var environments = {};

  _.each(_.keys(tmpEnvironments), function(key) {
    var data = tmpEnvironments[key];

    if ((data.name && data.name.length) && (data.url && data.url.length)) {
      environments[data.name] = data.url;
    }
  });

  chrome.storage.sync.set({storedEnvironments: environments});
}

function restore_options() {
  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    var index = 1;
    _.each(_.keys(items.storedEnvironments), function(key){

      var name = key,
          url = items.storedEnvironments[key];

      $('#deploy_spy_configuration')[0]['name_'+index].value = name;
      $('#deploy_spy_configuration')[0]['url_'+index].value = url;

      index++;
    });
  });
}

function import_options() {
  // preserve existing values as long as they are not named
  // the same as an imported one
  var environments;
  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    environments = items.storedEnvironments;
  });

  var url = $('#import_url')[0].value;

  $.getJSON(url, function(importedEnvironments) {
    _.extend(environments, importedEnvironments);
    chrome.storage.sync.set({storedEnvironments: environments});
  });

  restore_options();
  return false;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('import').addEventListener('click', import_options);
