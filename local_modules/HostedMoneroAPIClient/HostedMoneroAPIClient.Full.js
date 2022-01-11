'use strict'

import HostedSafexAPIClient_Base from './HostedSafexAPIClient_Base'

class HostedSafexAPIClient extends HostedSafexAPIClient_Base {
  //
  // Lifecycle - Init
  constructor (options, context) {
    super(options, context)
  }

  //
  // Runtime - Accessors - Private - Requests - Overrides
  _new_apiAddress_authority () // authority means [subdomain.]host.…[:…]
  {
    const self = this
    const settingsController = self.context.settingsController
    if (settingsController.hasBooted != true) {
      throw 'Expected SettingsController to have been booted'
    }
    const specificAPIAddressURLAuthority = self.context.settingsController.specificAPIAddressURLAuthority || ''
    if (specificAPIAddressURLAuthority != '') {
      return specificAPIAddressURLAuthority
    }
    // fall back to mysafex server
    return super._new_apiAddress_authority()
  }
}
export default HostedSafexAPIClient
