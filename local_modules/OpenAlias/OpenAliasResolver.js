'use strict'

import EventEmitter from 'events'
import safex_openalias_utils from './safex_openalias_utils'

class OpenAliasResolver extends EventEmitter {
  constructor (options, context) {
    super() // must call super before we can access `this`
    const self = this
    {
      self.options = options
      self.txtRecordResolver = options.txtRecordResolver // probably a better way to inject this dependency than using context
      //
      self.context = context
    }
    self.setMaxListeners(10000) // in case we have many contacts… :P
  }

  //
  //
  // Runtime - Accessors - Events
  //
  EventName_resolvedOpenAliasAddress () {
    return 'EventName_resolvedOpenAliasAddress'
  }

  //
  //
  // Runtime - Accessors - Transforms
  //
  DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress (address) {
    const self = this
    //
    return safex_openalias_utils.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address)
  }

  //
  //
  // Runtime - Imperatives (not Accessors because these cause emits and so have [side-]effects)
  //
  ResolveOpenAliasAddress (openAliasAddress, fn) { // -> DNSResolverHandle
    const self = this
    const resolverHandle = safex_openalias_utils.ResolvedSafexAddressInfoFromOpenAliasAddress(
      openAliasAddress,
      self.txtRecordResolver,
      self.context.nettype,
      self.context.safex_utils,
      function (
        err,
        safexReady_address,
        payment_id, // may be undefined
        tx_description,
        openAlias_domain,
        oaRecords_0_name,
        oaRecords_0_description,
        dnssec_used_and_secured
      ) {
        if (err) {
          fn(
            err,
            openAliasAddress // for consumer reference
          )
          return
        }
        setTimeout(
          function () {
            self.emit(
              self.EventName_resolvedOpenAliasAddress(),
              //
              openAliasAddress,
              //
              safexReady_address,
              payment_id, // may be undefined
              tx_description, // may be undefined
              //
              openAlias_domain,
              oaRecords_0_name,
              oaRecords_0_description,
              dnssec_used_and_secured
            )
          }
        )
        if (fn) {
          fn(
            null,
            openAliasAddress, // for consumer reference
            //
            safexReady_address,
            payment_id, // may be undefined
            tx_description, // may be undefined
            //
            openAlias_domain,
            oaRecords_0_name,
            oaRecords_0_description,
            dnssec_used_and_secured
          )
        }
      }
    )
    return resolverHandle
  }
}
export default OpenAliasResolver
