/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { expect as expectCli, test } from '@oclif/test'

describe('service:snapshot', () => {
  jest.spyOn(Date, 'now').mockReturnValue(123456789)
  const mockedFileSize = 10000

  const manifestContent = JSON.stringify(
    {
      block_height: 3,
      checksum: Buffer.from('foo').toString('hex'),
      file_name: `ironfish_snapshot_${Date.now()}.tar.gz`,
      file_size: mockedFileSize,
      timestamp: Date.now(),
    },
    undefined,
    '  ',
  )

  beforeAll(() => {
    jest.doMock('@ironfish/sdk', () => {
      const originalModule = jest.requireActual('@ironfish/sdk')

      const response = {
        contentStream: jest.fn(async function* () {
          const stream = [
            { start: 1, stop: 3 },
            { start: 1, stop: 3, seq: 3, buffer: Buffer.from('foo') },
          ]

          for await (const value of stream) {
            yield value
          }
        }),
      }

      const client = {
        connect: jest.fn(),
        snapshotChainStream: jest.fn().mockReturnValue(response),
      }

      const mockFileSystem = {
        mkdir: jest.fn(),
        resolve: jest.fn(),
        join: jest
          .fn()
          .mockReturnValueOnce('testtempdir/blocks')
          .mockReturnValueOnce('testtempdir/blocks/3')
          .mockReturnValueOnce(`testtempdir/ironfish_snapshot_${Date.now()}.tar.gz`)
          .mockReturnValueOnce(`testtempdir/manifest.json`),
      }

      const module: typeof jest = {
        ...originalModule,
        IronfishSdk: {
          init: jest.fn().mockReturnValue({
            connectRpc: jest.fn().mockResolvedValue(client),
            client,
            fileSystem: mockFileSystem,
          }),
          response,
        },
      }

      return module
    })

    jest.mock('aws-sdk', () => {
      const mockS3 = {
        upload: jest.fn().mockReturnThis(),
        promise: jest.fn(),
      }
      return { S3: jest.fn(() => mockS3) }
    })

    jest.mock('tar', () => {
      return { create: jest.fn() }
    })

    jest.mock('crypto', () => {
      const mockHasher = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(Buffer.from('foo')),
      }
      return { createHash: jest.fn(() => mockHasher), Hash: jest.fn(() => mockHasher) }
    })

    jest.mock('fs/promises', () => {
      const mockFileHandle = {
        createReadStream: jest.fn().mockReturnValue(['test']),
      }

      const mockStats = {
        size: mockedFileSize,
      }

      return {
        open: jest.fn().mockReturnValue(mockFileHandle),
        writeFile: jest.fn(() => Promise.resolve()),
        mkdtemp: jest.fn().mockReturnValue('testtempdir/'),
        FileHandle: jest.fn(() => mockFileHandle),
        stat: jest.fn(() => mockStats),
      }
    })
  })

  afterAll(() => {
    jest.dontMock('@ironfish/sdk')
  })

  describe('exports a snapshot of the chain and uploads it', () => {
    test
      .stdout()
      .command(['service:snapshot', '--bucket=testbucket'])
      .exit(0)
      .it('outputs the contents of manifest.json', (ctx) => {
        expectCli(ctx.stdout).include(manifestContent)
      })
  })
})
