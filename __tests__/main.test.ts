import * as process from 'process'
import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import nock from 'nock'
import action from '../src/action'
import {Context} from '@actions/github/lib/context'
import {WebhookPayload} from '@actions/github/lib/interfaces'

nock.disableNetConnect()

describe('pr-label-by-base', () => {
  beforeEach(() => {
    setupEnvironmentVariables()
  })

  it('adds the "main" label for "main" branch', async () => {
    nock('https://api.github.com')
      .get(
        '/repos/Codertocat/Hello-World/contents/.github%2Fpr-label-by-base.yml?ref=main'
      )
      .reply(200, configFixture())
      .post('/repos/Codertocat/Hello-World/issues/1/labels', (body: any) => {
        expect(body).toMatchObject({
          labels: ['main']
        })
        return true
      })
      .reply(200)

    await action(
      new MockContext(pullRequestOpenedFixture({ref: 'fix'}, {baseRef: 'main'}))
    )
    expect.assertions(1)
  })

  it('adds multi labels for "multi" branch', async () => {
    nock('https://api.github.com')
      .get(
        '/repos/Codertocat/Hello-World/contents/.github%2Fpr-label-by-base.yml?ref=multi'
      )
      .reply(200, configFixture())
      .post('/repos/Codertocat/Hello-World/issues/1/labels', (body: any) => {
        expect(body).toMatchObject({
          labels: ['1', '2', '3']
        })
        return true
      })
      .reply(200)

    await action(
      new MockContext(
        pullRequestOpenedFixture(
          {ref: 'fix/ARCH-555_MoreThings'},
          {baseRef: 'multi'}
        )
      )
    )
    expect.assertions(1)
  })

  it('does not add labels if they are not configured', async () => {
    nock('https://api.github.com')
      .get(
        '/repos/Codertocat/Hello-World/contents/.github%2Fpr-label-by-base.yml?ref=unknown'
      )
      .reply(200, configFixture())

    await action(
      new MockContext(
        pullRequestOpenedFixture(
          {ref: 'fix/ARCH-555_unknown'},
          {baseRef: 'unknown'}
        )
      )
    )
    expect.assertions(0)
  })
})

class MockContext extends Context {
  constructor(payload: WebhookPayload) {
    super()
    this.payload = payload
  }
}

function encodeContent(content: Buffer) {
  return Buffer.from(content).toString('base64')
}

function configFixture(fileName = 'config.yml') {
  return {
    type: 'file',
    encoding: 'base64',
    size: 5362,
    name: fileName,
    path: `.github/${fileName}`,
    content: encodeContent(
      fs.readFileSync(path.join(__dirname, `fixtures/${fileName}`))
    ),
    sha: '3d21ec53a331a6f037a91c368710b99387d012c1',
    url:
      'https://api.github.com/repos/octokit/octokit.rb/contents/.github/release-drafter.yml',
    git_url:
      'https://api.github.com/repos/octokit/octokit.rb/git/blobs/3d21ec53a331a6f037a91c368710b99387d012c1',
    html_url:
      'https://github.com/octokit/octokit.rb/blob/master/.github/release-drafter.yml',
    download_url:
      'https://raw.githubusercontent.com/octokit/octokit.rb/master/.github/release-drafter.yml',
    _links: {
      git:
        'https://api.github.com/repos/octokit/octokit.rb/git/blobs/3d21ec53a331a6f037a91c368710b99387d012c1',
      self:
        'https://api.github.com/repos/octokit/octokit.rb/contents/.github/release-drafter.yml',
      html:
        'https://github.com/octokit/octokit.rb/blob/master/.github/release-drafter.yml'
    }
  }
}

function pullRequestOpenedFixture(
  {ref}: {ref: string},
  {baseRef}: {baseRef: string}
) {
  return {
    pull_request: {
      number: 1,
      head: {
        ref
      },
      base: {
        ref: baseRef
      }
    },
    repository: {
      name: 'Hello-World',
      owner: {
        login: 'Codertocat'
      }
    }
  }
}

function setupEnvironmentVariables() {
  // configuration-path parameter is required
  // parameters are exposed as environment variables: https://help.github.com/en/github/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepswith
  process.env['GITHUB_REPOSITORY'] = ''
  process.env['INPUT_CONFIGURATION-PATH'] = '.github/pr-label-by-base.yml'
  process.env['REPO_ACCESS_TOKEN'] =
    "it doesn't matter here, but you need it for the real thing"
}
