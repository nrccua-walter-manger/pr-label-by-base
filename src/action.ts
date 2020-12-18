import * as core from '@actions/core'
import * as github from '@actions/github'
import * as yaml from 'js-yaml'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'

type PullRequestValidation = {
  PullRequestNumber?: number
  ErrorMessage?: string
}

interface RepoInfo {
  owner: string
  repo: string
}

async function action(context: Context = github.context): Promise<void> {
  try {
    const token = process.env.REPO_ACCESS_TOKEN!
    const client = github.getOctokit(token)
    const configPath = core.getInput('configuration-path', {required: true})

    const prValidation = validatePullRequest(context)
    if (prValidation.ErrorMessage) {
      core.info(prValidation.ErrorMessage)
      return
    }

    const targetBranch = context.payload?.pull_request?.base.ref
    const labels: string[] = await getLabels(
      client,
      configPath,
      targetBranch,
      context
    )
    core.debug(`labels to apply: ${labels}`)

    if (labels && labels.length > 0) {
      await client.issues.addLabels({
        ...context.repo,
        issue_number: prValidation.PullRequestNumber!,
        labels
      })
    }
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

function validatePullRequest(
  context: Context = github.context
): PullRequestValidation {
  const requireOpenedAction = false

  if (!context.payload.pull_request) {
    return {
      ErrorMessage:
        'This action is supposed to run for pull requests only, exiting'
    }
  }

  if (requireOpenedAction && context.payload.action !== 'opened') {
    return {
      ErrorMessage:
        'This action is supposed to run for pull requests that are being opened only.'
    }
  }

  return {PullRequestNumber: context.payload.pull_request.number}
}

async function getLabels(
  client: InstanceType<typeof GitHub>,
  configurationPath: string,
  branchRef: string,
  context: Context
): Promise<string[]> {
  const configurationContent: string = await fetchContent(
    client,
    configurationPath,
    context.repo,
    branchRef
  )

  const configObject: any = yaml.safeLoad(configurationContent)
  core.debug(`labels for ${branchRef}: ${JSON.stringify(configObject)}`)
  return configObject['branchLabels'][branchRef]
}

async function fetchContent(
  client: InstanceType<typeof GitHub>,
  path: string,
  {owner, repo}: RepoInfo,
  ref: string
): Promise<string> {
  const response: any = await client.repos.getContent({
    owner,
    repo,
    path,
    ref
  })

  return Buffer.from(response.data.content, response.data.encoding).toString()
}

export default action
