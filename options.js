function save_options() {
  const form = $('#deploy_spy_configuration');
  const tmpEnvironments = {};

  for (let input of form.serializeArray()) {
    let index = input.name.split("_")[1];
    if (!tmpEnvironments[index]) {
      tmpEnvironments[index] = {};
    }

    if (input.name.match("name")) {
      tmpEnvironments[index].name = input.value;
    } else if (input.name.match("url")) {
      tmpEnvironments[index].url = input.value;
    }
  }

  const environments = {};

  for (let key of Object.keys(tmpEnvironments)) {
    let data = tmpEnvironments[key];

    if ((data.name && data.name.length) && (data.url && data.url.length)) {
      environments[data.name] = data.url;
    }
  }

  chrome.storage.sync.set({storedEnvironments: environments});
}

function restore_options() {
  chrome.storage.sync.get({
    importUrl: "http://example.com/deploy_spy_config.json"
  }, function(storage) {
    $('#import_url').val(storage.importUrl);
  });

  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    let index = 1;
    for (let key of Object.keys(items.storedEnvironments)) {
      let url = items.storedEnvironments[key];
      let configElement = $('#deploy_spy_configuration')[0];

      configElement[`name_${index}`].value = key;
      configElement[`url_${index}`].value = url;

      index++;
    }
  });
}

function clear_options() {
  chrome.storage.sync.remove([
    "storedEnvironments",
    "importUrl"
  ]);
  restore_options();
}

function import_options() {
  // preserve existing values as long as they are not named
  // the same as an imported one
  let environments;
  chrome.storage.sync.get({
    storedEnvironments: {}
  }, function(items) {
    environments = items.storedEnvironments;
  });

  let url = $('#import_url')[0].value;
  chrome.storage.sync.set({importUrl: url});

  $.getJSON(url)
    .done(function(importedEnvironments) {
      Object.assign(environments, importedEnvironments);
      chrome.storage.sync.set({storedEnvironments: environments});
      restore_options();
    })
    .fail(function(f) {
      alert('Import Failed (put a valid URL to .../deploy_spy_config.json)' + f.responseText);
      return false;
    });
  return false;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_options);
document.getElementById('import').addEventListener('click', import_options);
