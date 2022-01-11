'use strict'

import async from 'async'
import { BigInteger as JSBigInt } from '@mysafex/mysafex-bigint' // important: grab defined export
import safex_config from '@mysafex/mysafex-safex-config'
import net_service_utils from '@mysafex/mysafex-net-service-utils'
import config__MySafex from './config__MySafex'

class HostedSafexAPIClient_Base {
  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context
    //
    self.request = options.request_conformant_module
    if (!self.request) {
      throw `${self.constructor.name} requires an options.request_conformant_module such as require('request' / 'xhr')`
    }
    //
    self.setup()
  }

  setup () {
    const self = this
    { // options
      self.appUserAgent_product = self.options.appUserAgent_product
      if (!self.appUserAgent_product) {
        throw `${self.constructor.name} requires options.appUserAgent_product`
      }
      self.appUserAgent_version = self.options.appUserAgent_version
      if (!self.appUserAgent_version) {
        throw `${self.constructor.name} requires options.appUserAgent_version`
      }
    }
  }

  //
  // Runtime - Accessors - Private - Requests
  _new_apiAddress_authority () { // overridable
    return config__MySafex.API__authority
  }

  //
  // Runtime - Accessors - Public - Requests
  LogIn (address, view_key__private, generated_locally, fn) { // fn: (err?, new_address?) -> RequestHandle
    const self = this
    const endpointPath = 'login'
    const parameters = net_service_utils.New_ParametersForWalletRequest(address, view_key__private)
    parameters.create_account = true
    parameters.generated_locally = generated_locally
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      endpointPath,
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      const new_address = data.new_address
      const received__generated_locally = data.generated_locally
      const start_height = data.start_height
      // console.log("data from login: ", data)
      // TODO? parse anything else?
      //
      fn(null, new_address, received__generated_locally, start_height)
    }
    return requestHandle
  }

  //
  // Syncing
  AddressInfo_returningRequestHandle (
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    fn
  ) { // -> RequestHandle
    const self = this
    const endpointPath = 'get_address_info'
    const parameters = net_service_utils.New_ParametersForWalletRequest(address, view_key__private)
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      endpointPath,
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      self.context.backgroundAPIResponseParser.Parsed_AddressInfo(
        // key-image-managed - just be sure to dekete your wallet's key img cache when you tear down
        data,
        address,
        view_key__private,
        spend_key__public,
        spend_key__private,
        function (err, returnValuesByKey) {
          if (err) {
            fn(err)
            return
          }
          let total_received_JSBigInt
          const total_received_String = returnValuesByKey.total_received_String
          if (total_received_String) {
            total_received_JSBigInt = new JSBigInt(total_received_String)
          } else {
            total_received_JSBigInt = new JSBigInt(0)
          }
          //
          let locked_balance_JSBigInt
          const locked_balance_String = returnValuesByKey.locked_balance_String
          if (locked_balance_String) {
            locked_balance_JSBigInt = new JSBigInt(locked_balance_String)
          } else {
            locked_balance_JSBigInt = new JSBigInt(0)
          }
          //
          let total_sent_JSBigInt
          const total_sent_String = returnValuesByKey.total_sent_String
          if (total_sent_String) {
            total_sent_JSBigInt = new JSBigInt(total_sent_String)
          } else {
            total_sent_JSBigInt = new JSBigInt(0)
          }
          fn(
            err,
            //
            total_received_JSBigInt,
            locked_balance_JSBigInt,
            total_sent_JSBigInt,
            //
            returnValuesByKey.spent_outputs,
            returnValuesByKey.account_scanned_tx_height,
            returnValuesByKey.account_scanned_block_height,
            returnValuesByKey.account_scan_start_height,
            returnValuesByKey.transaction_height,
            returnValuesByKey.blockchain_height,
            //
            returnValuesByKey.ratesBySymbol
          )
        }
      )
    }
    return requestHandle
  }

  AddressTransactions_returningRequestHandle (
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    fn
  ) { // -> RequestHandle
    const self = this
    const endpointPath = 'get_address_txs'
    const parameters = net_service_utils.New_ParametersForWalletRequest(address, view_key__private)
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      endpointPath,
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __parseAndCallBack(data)
      }
    )
    function __parseAndCallBack (data) {
      self.context.backgroundAPIResponseParser.Parsed_AddressTransactions(
        data,
        address,
        view_key__private,
        spend_key__public,
        spend_key__private,
        function (err, returnValuesByKey) {
          if (err) {
            fn(err)
            return
          }
          //
          const transactions = returnValuesByKey.serialized_transactions
          for (const transaction of transactions) {
            transaction.amount = new JSBigInt(transaction.amount)
            if (typeof transaction.total_sent !== 'undefined' && transaction.total_sent !== null) {
              transaction.total_sent = new JSBigInt(transaction.total_sent)
            }
            transaction.timestamp = new Date(transaction.timestamp)
          }
          //
          fn(
            err,
            //
            returnValuesByKey.account_scanned_height,
            returnValuesByKey.account_scanned_block_height,
            returnValuesByKey.account_scan_start_height,
            returnValuesByKey.transaction_height,
            returnValuesByKey.blockchain_height,
            //
            transactions
          )
        }
      )
    }
    return requestHandle
  }

  //
  // Getting wallet txs import info
  ImportRequestInfoAndStatus (
    address,
    view_key__private,
    fn
  ) { // -> RequestHandle
    const self = this
    const endpointPath = 'import_wallet_request'
    const parameters = net_service_utils.New_ParametersForWalletRequest(address, view_key__private)
    net_service_utils.AddUserAgentParamters(
      parameters,
      self.appUserAgent_product,
      self.appUserAgent_version
    )
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      endpointPath,
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      const payment_id = data.payment_id
      const payment_address = data.payment_address
      const import_fee__JSBigInt = new JSBigInt(data.import_fee)
      const feeReceiptStatus = data.status
      fn(
        null,
        payment_id,
        payment_address,
        import_fee__JSBigInt,
        feeReceiptStatus
      )
    }
    return requestHandle
  }

  //
  // Getting outputs for sending funds
  UnspentOuts (req_params, fn) { // -> RequestHandle
    const self = this
    net_service_utils.AddUserAgentParamters(
      req_params,
      self.appUserAgent_product,
      self.appUserAgent_version
    )
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      'get_unspent_outs',
      req_params,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }

  RandomOuts (req_params, fn) { // -> RequestHandle
    const self = this
    net_service_utils.AddUserAgentParamters(
      req_params,
      self.appUserAgent_product,
      self.appUserAgent_version
    )
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      'get_random_outs',
      req_params,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }

  //
  // Runtime - Imperatives - Public - Sending funds
  SubmitRawTx (req_params, fn) {
    const self = this
    // just a debug feature:
    if (self.context.HostedSafexAPIClient_DEBUGONLY_mockSendTransactionSuccess === true) {
      if (self.context.isDebug === true) {
        console.warn('⚠️  WARNING: Mocking that SubmitSerializedSignedTransaction returned a success response w/o having hit the server.')
        fn(null, {})
        return
      } else {
        throw `[${self.constructor.name}/SubmitSerializedSignedTransaction]: context.HostedSafexAPIClient_DEBUGONLY_mockSendTransactionSuccess was true despite isDebug not being true. Set back to false for production build.`
      }
    }
    net_service_utils.AddUserAgentParamters(
      req_params,
      self.appUserAgent_product,
      self.appUserAgent_version
    )
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      'submit_raw_tx',
      req_params,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }
}
export default HostedSafexAPIClient_Base
