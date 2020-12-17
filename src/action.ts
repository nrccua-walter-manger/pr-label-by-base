import * as core from '@actions/core'

async function action(): Promise<void> {
  try {
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

export default action
