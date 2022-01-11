'use strict'

import response_parser_utils from '@mysafex/mysafex-response-parser-utils'
import safex_keyImage_cache_utils from '@mysafex/mysafex-keyimage-cache'

class BackgroundResponseParser {
  constructor (options, context) {
    if (typeof options.coreBridge_instance === 'undefined' || options.coreBridge_instance == null) {
      throw 'BackgroundResponseParser.web expected options.coreBridge_instance'
    }
    const self = this
    self.coreBridge_instance = options.coreBridge_instance
  }

  //
  // Runtime - Accessors - Interface
  //
  Parsed_AddressInfo (
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    fn // : (err?, returnValuesByKey?) -> Void
  ) {
    const self = this
    response_parser_utils.Parsed_AddressInfo__keyImageManaged(
      data,
      address,
      view_key__private,
      spend_key__public,
      spend_key__private,
      self.coreBridge_instance,
      function (err, returnValuesByKey) {
        fn(err, returnValuesByKey)
      }
    )
  }

  Parsed_AddressTransactions (
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    fn // : (err?, returnValuesByKey?) -> Void
  ) {
    const self = this
    response_parser_utils.Parsed_AddressTransactions__keyImageManaged(
      data,
      address,
      view_key__private,
      spend_key__public,
      spend_key__private,
      self.coreBridge_instance,
      function (err, returnValuesByKey) {
        fn(err, returnValuesByKey)
      }
    )
  }

  //
  DeleteManagedKeyImagesForWalletWith (
    address,
    fn // ((err) -> Void)?
  ) {
    safex_keyImage_cache_utils.DeleteManagedKeyImagesForWalletWith(address)
    if (fn) {
      // setImmediate(fn)
    }
  }
}
export default BackgroundResponseParser
