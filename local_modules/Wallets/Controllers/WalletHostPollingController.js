'use strict'

const manualRefreshCoolDownMinimumTimeInterval_s = 10
const pollingPeriodTimeInterval_s = 30
//
class WalletHostPollingController {
  /// /////////////////////////////////////////////////////////////////////////////
  // Lifecycle - Setup

  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context
    //
    self.factorOfIsFetchingStateDidUpdate_fn = self.options.factorOfIsFetchingStateDidUpdate_fn || function () {}
    //
    // This controller is to be instantiated and owned by a HostedWallet instance
    self.wallet = self.options.wallet
    if (typeof self.wallet === 'undefined' || self.wallet === null) {
      throw 'wallet must not be nil'
    }
    //
    //
    self.setup()
  }

  setup () {
    const self = this
    //
    // we're just immediately going to jump into the runtime - so only instantiate self when you're ready to do this
    setTimeout(function () {
      self.performRequests()
    }, 100) // give everything a moment to get rendered - it would be great to get these on a background thread
    // but note all checks must be synchronized on that thread
    self.startPollingTimer()
  }

  //
  // Lifecycle - Teardown
  TearDown () { // this is public and must be called manually by wallet
    const self = this
    console.log(`♻️  Tearing down ${self.constructor.name}`)
    self._tearDown_stopTimers()
    self._tearDown_abortAndFreeRequests()
  }

  _tearDown_stopTimers () {
    const self = this
    if (typeof self.intervalTimeout === 'undefined' || self.intervalTimeout === null) {
      throw '_tearDown_stopTimers called but self.intervalTimeout already nil'
    }
    self.invalidateTimer()
  }

  _tearDown_abortAndFreeRequests () {
    const self = this
    { // acct info
      const req = self.requestHandle_for_accountInfo
      if (typeof req !== 'undefined' && req !== null) {
        console.log('💬  Aborting running acct info request')
        req.abort()
      }
      self.requestHandle_for_accountInfo = null
    }
    { // acct info
      const req = self.requestHandle_for_transactions
      if (typeof req !== 'undefined' && req !== null) {
        console.log('💬  Aborting running transactions history request')
        req.abort()
      }
      self.requestHandle_for_transactions = null
    }
    self._didUpdate_factorOf_isFetchingState() // not sure if we care about this here - we're tearing down - is emitting not desired then? probably doesn't matter
  }

  //
  // Runtime - Accessors - State
  IsFetchingAnyUpdates () {
    const self = this
    //
    return self.IsFetching_accountInfo() || self.IsFetching_transactions()
  }

  IsFetching_accountInfo () {
    const self = this
    //
    return typeof self.requestHandle_for_accountInfo !== 'undefined' && self.requestHandle_for_accountInfo !== null
  }

  IsFetching_transactions () {
    const self = this
    //
    return typeof self.requestHandle_for_transactions !== 'undefined' && self.requestHandle_for_transactions !== null
  }

  //
  // Imperatives - Manual refresh
  requestFromUI_manualRefresh () {
    const self = this
    if (self.IsFetching_accountInfo() || self.IsFetching_transactions()) {
      return // still refreshing.. no need
    }
    // now since addressInfo and addressTransactions are nearly happening at the same time (with failures and delays unlikely), I'm just going to use time since addressTransactions to approximate length since last collective refresh
    let mutable_hasBeenLongEnoughSinceLastRefreshToRefresh = false
    if (self._dateOfLast_fetch_addressTransactions == null || typeof self._dateOfLast_fetch_addressTransactions === 'undefined') {
      mutable_hasBeenLongEnoughSinceLastRefreshToRefresh = true
    } else {
      // we know a request is not _currently_ happening, so nil date means one has never happened
      const msDiff_sinceLastRefresh = (new Date()).getTime() - self._dateOfLast_fetch_addressTransactions.getTime()
      const s_sinceLastRefresh = Math.abs(msDiff_sinceLastRefresh / 1000)
      if (s_sinceLastRefresh >= manualRefreshCoolDownMinimumTimeInterval_s) {
        mutable_hasBeenLongEnoughSinceLastRefreshToRefresh = true
      }
    }
    const hasBeenLongEnough = mutable_hasBeenLongEnoughSinceLastRefreshToRefresh
    if (hasBeenLongEnough) {
      // and here we again know we don't have any requests to cancel
      self.performRequests() // approved manual refresh
      //
      self.invalidateTimer() // clear and reset timer to push next fresh out by timer period
      self.startPollingTimer()
    }
  }

  //
  // Runtime - Imperatives - Polling
  performRequests () {
    const self = this
    self._fetch_accountInfo()
    self._fetch_transactionHistory()
  }

  invalidateTimer () {
    const self = this
    // console.log("💬  Clearing polling intervalTimeout.")
    clearInterval(self.intervalTimeout)
    self.intervalTimeout = null
  }

  startPollingTimer () {
    const self = this
    // it would be cool to change the sync polling interval to faster while any transactions are pending confirmation, then dial it back while passively waiting
    self.intervalTimeout = setInterval(function () {
      self.performRequests()
    }, pollingPeriodTimeInterval_s * 1000 /* ms */)
  }

  //
  // Runtime - Imperatives - Private - Requests
  _fetch_accountInfo () { // -> HostedSafexAPIClient_RequestHandle
    const __debug_fnName = '_fetch_accountInfo'
    const self = this
    const wallet = self.wallet
    const fn = function (errOrNil) {
      if (errOrNil) {
        // TODO: how to handle this? we'll retry soon enough
      }
      // success
    }
    //
    if (typeof self.requestHandle_for_accountInfo !== 'undefined' && self.requestHandle_for_accountInfo !== null) {
      const warnStr = '⚠️  _fetch_accountInfo called but request already taking place. Bailing'
      console.warn(warnStr)
      fn() // not an error we'd necessarily want to bubble
      return
    }
    //
    if (wallet.isLoggedIn !== true) {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as isLoggedIn !== true'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    if (typeof wallet.public_address === 'undefined' && wallet.public_address === null || wallet.public_address === '') {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as no public_address'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    if (typeof wallet.private_keys === 'undefined' && wallet.private_keys === null) {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as no private_keys'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    const requestHandle = self.context.hostedSafexAPIClient.AddressInfo_returningRequestHandle(
      wallet.public_address,
      wallet.private_keys.view,
      wallet.public_keys.spend,
      wallet.private_keys.spend,
      function (
        err,
        total_received,
        locked_balance,
        total_sent,
        spent_outputs,
        account_scanned_tx_height,
        account_scanned_block_height,
        account_scan_start_height,
        transaction_height,
        blockchain_height,
        ratesBySymbol
      ) {
        // immediately unlock this request fetch
        self.requestHandle_for_accountInfo = null
        self._didUpdate_factorOf_isFetchingState()
        //
        if (err) { // already logged
          fn(err)
          return
        }
        //
        // i figure it should be okay to directly call this as this is
        // an intra-module rather than inter-module call; a protocol would
        // be used to enforce this at compile-time
        wallet._WalletHostPollingController_didFetch_accountInfo(
          total_received,
          locked_balance,
          total_sent,
          spent_outputs,
          account_scanned_tx_height,
          account_scanned_block_height,
          account_scan_start_height,
          transaction_height,
          blockchain_height,
          ratesBySymbol
        )
      }
    )
    self.requestHandle_for_accountInfo = requestHandle
    self._didUpdate_factorOf_isFetchingState()
  }

  _fetch_transactionHistory () { // fn: (err?) -> HostedSafexAPIClient_RequestHandle
    const __debug_fnName = '_fetch_transactionHistory'
    const self = this
    const wallet = self.wallet
    const fn = function (errOrNil) {
      if (errOrNil) {
        // TODO: how to handle this? we'll retry soon enough
      }
      // success
    }
    //
    if (typeof self.requestHandle_for_transactions !== 'undefined' && self.requestHandle_for_transactions !== null) {
      const warnStr = '⚠️  _fetch_transactionHistory called but request already taking place. Bailing'
      console.warn(warnStr)
      fn() // not an error we'd necessarily want to bubble
      return
    }
    //
    if (wallet.isLoggedIn !== true) {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as isLoggedIn !== true'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    if (typeof wallet.public_address === 'undefined' && wallet.public_address === null || wallet.public_address === '') {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as no public_address'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    if (typeof wallet.private_keys === 'undefined' && wallet.private_keys === null) {
      const errStr = '❌  Unable to ' + __debug_fnName + ' as no private_keys'
      console.error(errStr)
      const err = new Error(errStr)
      fn(err)
      return
    }
    const requestHandle = self.context.hostedSafexAPIClient.AddressTransactions_returningRequestHandle(
      wallet.public_address,
      wallet.private_keys.view,
      wallet.public_keys.spend,
      wallet.private_keys.spend,
      function (
        err,
        account_scanned_height,
        account_scanned_block_height,
        account_scan_start_height,
        transaction_height,
        blockchain_height,
        transactions
      ) {
        self._dateOfLast_fetch_addressTransactions = new Date()
        //
        // immediately unlock this request fetch
        self.requestHandle_for_transactions = null
        self._didUpdate_factorOf_isFetchingState()
        //
        if (err) { // already logged
          fn(err)
          return
        }
        //
        wallet._WalletHostPollingController_didFetch_transactionHistory(
          account_scanned_height,
          account_scanned_block_height,
          account_scan_start_height,
          transaction_height,
          blockchain_height,
          transactions
        )
      }
    )
    self.requestHandle_for_transactions = requestHandle
    self._didUpdate_factorOf_isFetchingState()
  }

  //
  // Delegation - Internal
  _didUpdate_factorOf_isFetchingState () {
    const self = this
    const lastEmittedState = self.lastEmitted_isFetchingUpdate
    const currentState = self.IsFetchingAnyUpdates()
    self.lastEmitted_isFetchingUpdate = currentState
    function __really_emit () {
      self.factorOfIsFetchingStateDidUpdate_fn()
    }
    if (lastEmittedState !== true && lastEmittedState !== false) { // not yet been one recorded
      __really_emit()
    } else if (lastEmittedState != currentState) { // change in state
      __really_emit()
    } else {
      // a request finished but one is still going
      if (!self.IsFetching_accountInfo() && !self.IsFetching_transactions()) {
        // assert false
      }
    }
  }
}
export { WalletHostPollingController }
