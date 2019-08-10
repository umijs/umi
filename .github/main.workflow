workflow "deploy site" {
  on = "push"
  resolves = ["release"]
}

# Filter for master branch
action "master-branch-filter" {
  #  needs = "alias"
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "release" {
  # needs = "master-branch-filter"
  uses = "actions/zeit-now@master"
  args = "alias --local-config=./website/now.json"
  secrets = ["ZEIT_TOKEN"]
}
