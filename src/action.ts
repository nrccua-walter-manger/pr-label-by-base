import * as core from '@actions/core'
import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'

async function action(context: Context = github.context): Promise<void> {
  try {
    const token = process.env.REPO_ACCESS_TOKEN!
    const client = github.getOctokit(token)
    core.debug(`client: ${JSON.stringify(client)}`)
    //const configPath = core.getInput('configuration-path', {required: true})
    //core.debug(`configPath: ${JSON.stringify(configPath)}`)

    core.setOutput('time', new Date().toTimeString())
    core.setOutput('context', context)
  } catch (error) {
    core.setFailed(error.message)
  }
}

export default action
