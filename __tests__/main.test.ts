import * as process from 'process'
// import * as cp from 'child_process'
// import * as path from 'path'
// import action from '../src/action'

describe('pr-label-by-base', () => {
  beforeEach(() => {
    setupEnvironmentVariables()
  })

  it('does almost nothing', async () => {})
})

// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10)
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number')
// })

// shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   const np = process.execPath
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execFileSync(np, [ip], options).toString())
// })

function setupEnvironmentVariables() {
  // configuration-path parameter is required
  // parameters are exposed as environment variables: https://help.github.com/en/github/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepswith
  process.env['GITHUB_REPOSITORY'] = ''
  process.env['INPUT_CONFIGURATION-PATH'] = '.github/pr-labeler.yml'
  process.env['REPO_ACCESS_TOKEN'] =
    "it doesn't matter here, but you need it for the real thing"
}
