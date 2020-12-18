# PR Label By Branch

A Github Action that labels your Pull Request based on the base ref branch.

## Usage

Add a `.github/pr-label-by-base.yml` configuration file:

``` yaml
branchLabels:
  main: ['main']
  multi: ['1', '2', '3']

```

Add this Action to your workflow:

``` yaml
name: PR Labeler
on:
  pull_request:
    types: [opened]

jobs:
  pr-labeler:
    runs-on: ubuntu-latest
    steps:
      - uses: nrccua-walter-manger/pr-label-by-base@beta
        with:
          configuration-path: .github/pr-label-by-base.yml
        env:
          REPO_ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
