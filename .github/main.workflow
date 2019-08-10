workflow "deploy site" {
  on = "push"
  resolves = ["GitHub Action for Zeit"]
}

action "GitHub Action for Zeit" {
  uses = "actions/zeit-now@5c51b26db987d15a0133e4c760924896b4f1512f"
  env = {
    aaa = "aaa"
  }
}
