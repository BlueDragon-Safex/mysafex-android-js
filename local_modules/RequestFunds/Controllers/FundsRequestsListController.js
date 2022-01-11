'use strict'

import ListBaseController from '../../Lists/Controllers/ListBaseController'
import FundsRequest from '../Models/FundsRequest'

class FundsRequestsListController extends ListBaseController {
  setup () { // override
    const self = this
    //
    self.deferBootUntilFnCb = function (cb) { // this causes records to be loaded only once the wallets list controller has finished booting
      self.context.walletsListController.ExecuteWhenBooted(
        function () {
          cb()
          //
          self._startObserving_walletsListController() // waiting until here to do it to avoid any racing
        }
      )
    }
    super.setup()
  }

  _startObserving_walletsListController () {
    const self = this
    const emitter = self.context.walletsListController
    emitter.on(
      emitter.EventName_listUpdated(),
      function () {
        if (self.hasBooted != true) {
          console.warn('Wallets list controller observed to have updated but self.hasBooted != true so dropping.')
          return
        }
        self.overridable_finalizeAndSortRecords(
          function () {
            self.__listUpdated_records()
          }
        )
      }
    )
  }

  //
  // Overrides
  overridable_shouldSortOnEveryRecordAdditionAtRuntime () {
    return true // however, this will not apply to records that are programmatically inserted during the finalization & sorting process
  }

  override_CollectionName () {
    return 'FundsRequests'
  }

  override_lookup_RecordClass () {
    return FundsRequest
  }

  override_booting_reconstituteRecordInstanceOptionsWithBase (
    optionsBase, // _id is already supplied in this
    persistencePassword,
    forOverrider_instance_didBoot_fn,
    forOverrider_instance_didFailBoot_fn
  ) {
    const self = this
    optionsBase.persistencePassword = persistencePassword
    //
    // now supply actual callbacks
    optionsBase.failedToInitialize_cb = function (err, returnedInstance) {
      console.error('Failed to initialize funds request ', err, returnedInstance)
      // we're not going to pass this err through though because it will prevent booting... we mark the instance as 'errored'
      forOverrider_instance_didBoot_fn(err, returnedInstance)
    }
    optionsBase.successfullyInitialized_cb = function (returnedInstance) {
      forOverrider_instance_didBoot_fn(null, returnedInstance) // no err
    }
  }

  overridable_finalizeAndSortRecords (fn) // () -> Void; we must call this!
  {
    const self = this
    // do not call on `super` of fn could be called redundantly
    let waitingForInitOfNNew = 0
    let hasCalledFn = false
    let hasActuallyFinishedThisFunction = false
    function completedOneInit () {
      if (hasActuallyFinishedThisFunction == false) {
        console.log('Not calling fn because a new FundsRequest finished initializing before whole function did')
        return
      }
      if (waitingForInitOfNNew == 0) {
        if (hasCalledFn) {
          throw 'completedOneInit: Already called fn' // this should never happen because of the (waitingForInitOfNNew > 0) { return }
        }
        hasCalledFn = true
        // console.log("completedOneInit: Calling fn now")
        fn()
      } else {
        // console.log("completedOneInit: Still waiting on " + waitingForInitOfNNew + " objects to init")
      }
    }
    //
    // first, add any walletQRDisplayRequests which are missing
    const wallets = self.context.walletsListController.records
    const n_ws = wallets.length
    for (let i = 0; i < n_ws; i++) {
      const wallet = wallets[i]
      let hasRecord = false
      for (let i_er = 0; i_er < self.records.length; i_er++) {
        const record = self.records[i_er]
        if (record.is_displaying_local_wallet == true) {
          if (record.to_address == wallet.public_address) {
            hasRecord = true
            break
          }
        }
      }
      if (!hasRecord) { // this is effectively the initial migration for older versions of the app which already have wallet records
        const options =
				{
				  persistencePassword: wallet.persistencePassword,
				  to_address: wallet.public_address,
				  is_displaying_local_wallet: true
				}
        options.failedToInitialize_cb = function (err, returnedInstance) {
          console.error('Failed to initialize funds request ', err, returnedInstance)
          // we're not going to pass this err through though because it will prevent booting... we mark the instance as 'errored'
          waitingForInitOfNNew -= 1
          completedOneInit()
        }
        options.successfullyInitialized_cb = function (returnedInstance) {
          waitingForInitOfNNew -= 1
          completedOneInit()
        }
        const instance = new FundsRequest(options, self.context)
        waitingForInitOfNNew += 1
        self._atRuntime__record_wasSuccessfullySetUpAfterBeingAdded_noSortNoListUpdated(instance)
        // ^- this will add the record to the list and start observing it but won't emit a listUpdated early
        // ^- so that i can keep things synchronous and avoid racing to add the record to the list on multiple close wallet listUpdateds, I'm just going to assume it worked instead of chaining via options.successfullyInitialized_cb
      }
    }
    //
    // secondly, remove any qr display requests for now-deleted wallets
    const readyToSort_records = []
    for (let i_er = 0; i_er < self.records.length; i_er++) {
      const record = self.records[i_er]
      if (record.is_displaying_local_wallet == true) {
        const w = self.givenBootedWLC_findWallet(record.to_address, true/* suppress throw */)
        const foundWallet = w != null && typeof w !== 'undefined'
        if (foundWallet) {
          readyToSort_records.push(record)
        } else {
          // leaving these behind - but they must be deleted or they will stack up in the app/user docs dir
          console.log('Dropping request because wallet was removed: ', record)
          self.givenBooted_deleteRecord_noListUpdatedEmit(record, function (err) {})
        }
      } else {
        readyToSort_records.push(record)
      }
    }
    // finally, sort
    self.records = readyToSort_records.sort(
      function (a, b) {
        if (a.is_displaying_local_wallet != true) {
          if (b.is_displaying_local_wallet == true) {
            return -1
          }
        } else { // a.is_displaying_local_wallet = true
          if (b.is_displaying_local_wallet != true) {
            return 1
          } else {
            const a_w = self.givenBootedWLC_findWallet(a.to_address)
            const b_w = self.givenBootedWLC_findWallet(b.to_address)
            if (!b_w.dateWalletFirstSavedLocally) {
              throw 'Expected b_w.dateWalletFirstSavedLocally'
            }
            if (!a_w.dateWalletFirstSavedLocally) {
              throw 'Expected a_w.dateWalletFirstSavedLocally'
            }
            //
            return b_w.dateWalletFirstSavedLocally - a_w.dateWalletFirstSavedLocally
          }
        }
        return b.dateCreated - a.dateCreated
      }
    )
    hasActuallyFinishedThisFunction = true // this must be set
    if (waitingForInitOfNNew > 0) {
      // console.log("End: Still waiting on " + waitingForInitOfNNew + " objects to init")
      return
    }
    hasCalledFn = true
    fn() // ListBaseController overriders must call this!
  }

  //
  // Booted - Accessors
  givenBootedWLC_findWallet (addr, optl_suppressThrowOnNotFound) {
    const self = this
    const suppressThrowOnNotFound = optl_suppressThrowOnNotFound == true
    if (self.context.walletsListController.hasBooted != true) {
      throw 'code fault: givenBootedWLC_findWallet called while self.context.walletsListController.hasBooted!=true'
    }
    const wallets = self.context.walletsListController.records
    const ws_len = wallets.length
    for (let i = 0; i < ws_len; i++) {
      const w = wallets[i]
      if (w.public_address == addr) {
        return w
      }
    }
    if (suppressThrowOnNotFound != true) {
      throw 'Expected to find wallet for address' // TODO: maybe just filter those who don't actually have wallets before this
    }
    return undefined
  }

  //
  //
  // Booted - Imperatives - Public - List management
  //
  WhenBooted_AddFundsRequest (
    optl__from_fullname,
    optl__to_walletHexColorString,
    to_address,
    payment_id,
    amount_StringOrNil,
    amountCcySymbol,
    message,
    description,
    fn // fn: (err: Error?, instance: FundsRequest?) -> Void
  ) {
    const self = this
    self.ExecuteWhenBooted(
      function () {
        self.context.passwordController.WhenBootedAndPasswordObtained_PasswordAndType( // this will block until we have access to the pw
          function (obtainedPasswordString, userSelectedTypeOfPassword) {
            const options =
						{
						  persistencePassword: obtainedPasswordString,
						  //
						  from_fullname: optl__from_fullname || '',
						  to_walletHexColorString: optl__to_walletHexColorString || '',
						  to_address: to_address,
						  payment_id: payment_id,
						  amount_StringOrNil: amount_StringOrNil,
						  amountCcySymbol: amountCcySymbol,
						  message: message,
						  description: description
						}
            options.is_displaying_local_wallet = false // to be clear about the case
            //
            options.failedToInitialize_cb = function (err, returnedInstance) {
              console.error('Failed to initialize funds request ', err, returnedInstance)
              // we're not going to pass this err through though because it will prevent booting... we mark the instance as 'errored'
              fn(err)
            }
            options.successfullyInitialized_cb = function (returnedInstance) {
              self._atRuntime__record_wasSuccessfullySetUpAfterBeingAdded(returnedInstance)
              fn(null, returnedInstance)
            }
            const instance = new FundsRequest(options, self.context)
          }
        )
      }
    )
  }
}
export default FundsRequestsListController
