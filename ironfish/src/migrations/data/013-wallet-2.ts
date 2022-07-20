/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Assert } from '../../assert'
import { IronfishNode } from '../../node'
import { IDatabase } from '../../storage'
import { createDB } from '../../storage/utils'
import { Migration } from '../migration'

export class Migration013 extends Migration {
  path = __filename

  async prepare(node: IronfishNode): Promise<IDatabase> {
    await node.files.mkdir(node.accounts.db.location, { recursive: true })
    return createDB({ location: node.accounts.db.location })
  }

  async forward(node: IronfishNode): Promise<void> {
    Assert.isNotUndefined(this.accounts)
    Assert.isNotUndefined(this.chain)

    const { meta, accounts, noteToNullifier, nullifierToNote, transactions } = loadStores(
      this.accounts,
    )

    for await (const transaction of transactions.getAllValuesIter()) {
      console.log('EH', JSON.stringify(transaction, null, '  '))
    }

    throw new Error()

    // noteToNullifier.clear()
  }

  async backward(): Promise<void> {}
}
