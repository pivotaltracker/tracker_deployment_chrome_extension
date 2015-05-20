# Deploy Spy: Deployment Tracking Chrome Extension
If you are using the [Github's service hook](http://www.pivotaltracker.com/community/tracker-blog/guide-githubs-service-hook-tracker)
for [Pivotal Tracker](http://www.pivotaltracker.com) to label git commits with tracker stories then you can use
this extension to help you figure out exactly where your tracker stories are deployed!

In order to use this plugin you will need to provide a specifically formatted JSON file for each environment
your app can be deployed to.  For example, let's say you you have three environments: **staging, beta, and test**.
You would configure the extension with these three environments like so:

| Environment   | URL**                                    |
| ------------- |------------------------------------------|
| beta          | https://beta.example.com/commits.json    |
| staging       | https://staging.example.com/commits.json |
| testing       | https://test.example.com/commits.json    |

_**Note: The destination URLs must be served via HTTPS._

Then either manually, as part of your deployment scripts, etc. you update the commits.json file with recent commit
data.  For my purposes, I just generated data for all the commits within the last 30 days.  [This sample
rake task](sample.rake) is close to what we are using to generate this data ourselves and may be useful to you.

The data should be valid JSON with a format like this:

```json
"pivotal tracker story id": [
  "first git commit sha",
  "second git commit sha",
  "... and so on"
],
"123456": [
  "987s6afdsg8796dsf78h9hfa857s9h",
  "asdfg6asdf7ga7sfhgas5hgf5asdfg"
]
```

That's it!

Once configured correctly the extension will insert data about the deployment environments when you expand a story.

This shows the aggregate of all environments any part of the story is deployed to under the story info box:
![Story Detail](https://github.com/pivotaltracker/tracker_deployment_chrome_extension/blob/master/story_detail.png "Story Detail")

This shows the aggregate of all environments a specific commit is deployed to:
![Commit Detail](https://github.com/pivotaltracker/tracker_deployment_chrome_extension/blob/master/commit_detail.png "Commit Detail")
