/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { BufferMap } from 'buffer-map'
import { DecryptedNotesValue } from '../../account/database/decryptedNotes'
import { Assert } from '../../assert'
import { IronfishNode } from '../../node'
import { Transaction } from '../../primitives'
import { IDatabase, IDatabaseTransaction } from '../../storage'
import { createDB } from '../../storage/utils'
import { Migration } from '../migration'
import { NoteToNullifiersValue } from './013-wallet-2/noteToNullifier'
import { loadStores } from './013-wallet-2/stores'

const findNote = (transaction: Transaction, noteHash: string, nullifierEntry: NoteToNullifiersValue) => {
  if(nullifierEntry.noteIndex != null) {
    return transaction.getNote(nullifierEntry.noteIndex)
  }

  const noteHashBuffer = Buffer.from(noteHash, 'hex')

  for(const note of transaction.notes()) {
    if(note.merkleHash().equals(noteHashBuffer)) {
      return note
    }
  }

  return null
}

export class Migration013 extends Migration {
  path = __filename

  async prepare(node: IronfishNode): Promise<IDatabase> {
    await node.files.mkdir(node.accounts.db.location, { recursive: true })
    return createDB({ location: node.accounts.db.location })
  }

  async forward(node: IronfishNode, db: IDatabase, tx: IDatabaseTransaction): Promise<void> {
    // const { meta, accounts, noteToNullifier, nullifierToNote, transactions } = loadStores(db)

    // const noteToTransaction = new BufferMap<Buffer>()

    // for await (const [transactionHash, transactionEntry] of transactions.getAllIter()) {
    //   const transaction = new Transaction(transactionEntry.transaction)

    //   for(const note of transaction.notes()) {
    //     const noteHash = note.merkleHash()
    //     noteToTransaction.set(noteHash, transactionHash)
    //   }
    // }

    // for await (const [noteHash, nullifierEntry] of noteToNullifier.getAllIter()) {c
    //   const transactionHash = noteToTransaction.get(noteHash)

    //   if(!transactionHash) {
    //     throw new Error('TODO')
    //   }

    //   const transactionEntry = await transactions.get(transactionHash)

    //   if(!transactionEntry) {
    //     throw new Error('TODO 2')
    //   }

    //   const transaction = new Transaction(transactionEntry.transaction)
    //   const note = findNote(transaction, noteHash, nullifierEntry)

    //   if(!note) {
    //     throw new Error('TODO 3')
    //   }

    //   const decryptedNote: DecryptedNotesValue = {
    //     accountId: ,
    //     noteIndex: nullifierEntry.noteIndex,
    //     nullifierHash: nullifierEntry.nullifierHash,
    //     serializedNote: note.serialize(),
    //     spent: nullifierEntry.spent,
    //     transactionHash: transactionHash

    //   }
      // const transaction = new Transaction(transactionEntry.transaction)

      // console.log(
      //   'EH',
      //   JSON.stringify(
      //     {
      //       blockHash: transactionEntry.blockHash,
      //       submittedSequence: transactionEntry.submittedSequence,
      //       hash: transaction.hash().toString('hex'),
      //     },
      //     null,
      //     '  ',
      //   ),
      // )
    // }

    throw new Error()

    // noteToNullifier.clear()
  }

  async backward(): Promise<void> {}
}
