'use strict'
import WebComponents from "@mysafex/mysafex-web-components";
import TXTRecordResolver from '../../OpenAlias/TXTResolver.web'
import Pasteboard from '../../Pasteboard/Pasteboard.browser'
import URLBrowser from '../../URLBrowser/URLBrowser.browser'
import FilesystemUI from '../../FilesystemUI/FilesystemUI.browser'
import WindowDialogs from '../../WindowDialogs/WindowDialogs.browser'
import CcyConversionRates from '../../CcyConversionRates/Controller'
import SymmetricCryptor from '../../symmetric_cryptor/BackgroundStringCryptor.noOp'
import ContactsListController from '../../Contacts/Controllers/ContactsListController'
import DocumentPersister from '../../DocumentPersister/DocumentPersister.SecureStorage'
import BackgroundAPIResponseParser from '@mysafex/mysafex-response-parser-utils'
import HostedSafexAPIClient from '@mysafex/mysafex-hosted-api'
import OpenAlias from '../../OpenAlias/OpenAliasResolver'
import Theme from '../../Theme/ThemeController'
import FundsRequestsListController from '../../RequestFunds/Controllers/FundsRequestsListController'
import Passwords from '../../Passwords/Controllers/PasswordController.Full'
import Settings from '../../Settings/Controllers/SettingsController'
import UserIdle from '../../UserIdle/UserIdleInWindowController'
import WalletsList from '../../WalletsList/Controllers/WalletsListController.Full'
import WalletAppCoordinator from '../../WalletAppCoordinator/WalletAppCoordinator'
import ExceptionAlerting from '../Controllers/ExceptionAlerting.browser.web.js'

const txtRecordResolver = new TXTRecordResolver({})
function NewHydratedContext (initialContext) {
  initialContext = initialContext || {}

  const context = initialContext != null ? initialContext : {}

  context.pasteboard = new Pasteboard({}, context)
  context.urlBrowser = new URLBrowser({}, context)
  context.filesystemUI = new FilesystemUI({}, context)
  context.windowDialogs = new WindowDialogs({}, context)
  context.CcyConversionRates_Controller_shared = new CcyConversionRates({}, context)
  context.string_cryptor__background = new SymmetricCryptor({}, context)
  context.persister = new DocumentPersister({}, context)
  context.backgroundAPIResponseParser = new BackgroundAPIResponseParser({
    coreBridge_instance: initialContext.safex_utils // the same as coreBridge_instance
  }, context)
  context.hostedSafexAPIClient = new HostedSafexAPIClient({
    appUserAgent_product: initialContext.name,
    appUserAgent_version: initialContext.version,
    apiUrl: initialContext.apiUrl,
    request_conformant_module: require('xhr')
  }, context)
  context.openAliasResolver = new OpenAlias({
    txtRecordResolver: txtRecordResolver
  }, context)
  context.themeController = new Theme({}, context)
  context.passwordController = new Passwords({}, context)
  context.settingsController = new Settings({}, context)
  context.contactsListController = new ContactsListController({}, context)
  context.userIdleInWindowController = new UserIdle({}, context)
  context.walletsListController = new WalletsList({}, context)
  context.walletAppCoordinator = new WalletAppCoordinator({}, context)
  context.fundsRequestsListController = new FundsRequestsListController({}, context)
  context.exceptionAlerting = new ExceptionAlerting({}, context)

  const contextKeys = Object.keys(context)
  for (const i in contextKeys) {
    const contextKey = contextKeys[i]
    const instance = context[contextKey]
    // This calls an optional function that classes can implement to get control after the whole context is set up
    const postWholeContextInitSetupFn = instance.RuntimeContext_postWholeContextInit_setup
    if (typeof postWholeContextInitSetupFn !== 'undefined') {
      postWholeContextInitSetupFn.call(instance) // using 'call' so the function's "this" is instance
    }
  }

  return context
}

const obj = {
  NewHydratedContext
}

export default obj
