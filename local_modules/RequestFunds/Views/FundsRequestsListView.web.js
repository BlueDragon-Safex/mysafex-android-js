'use strict'

import View from '../../Views/View.web'
import ListView from '../../Lists/Views/ListView.web'
import commonComponents_emptyScreens from '../../MMAppUICommonComponents/emptyScreens.web'
import commonComponents_navigationBarButtons from '../../MMAppUICommonComponents/navigationBarButtons.web'
import FundsRequestsListCellView from './FundsRequestsListCellView.web'
import FundsRequestDetailsView from './FundsRequestDetailsView.web'
import FundsRequestQRDisplayView from './FundsRequestQRDisplayView.web'
import CreateRequestFormView from './CreateRequestFormView.web'
import StackAndModalNavigationView from '../../StackNavigation/Views/StackAndModalNavigationView.web'

class FundsRequestsListView extends ListView {
  constructor (options, context) {
    options.listController = context.fundsRequestsListController
    // ^- injecting dep so consumer of self doesn't have to
    super(options, context)
  }

  _setup_views () {
    const self = this
    self.currentlyPresented_CreateRequestFormView = null // zeroing for comparison
    super._setup_views()
    self._setup_emptyStateContainerView()
  }

  _setup_emptyStateContainerView () {
    const self = this
    const view = new View({}, self.context)
    self.emptyStateContainerView = view
    const layer = view.layer
    const margin_side = 16
    const marginTop = 56 - 41 // TODO: do this in VDA and query actual nav bar height
    const marginBottom = 14
    layer.style.marginTop = `${marginTop}px`
    layer.style.marginLeft = margin_side + 'px'
    layer.style.width = `calc(100% - ${2 * margin_side}px)`
    layer.style.height = `calc(100% - ${marginTop + marginBottom}px)`
    {
      const emptyStateMessageContainerView = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
        '🤑',
        "You haven't made any<br/>requests yet.",
        self.context,
        0,
        0
      )
      self.emptyStateMessageContainerView = emptyStateMessageContainerView
      view.addSubview(emptyStateMessageContainerView)
    }
    view.SetVisible = function (isVisible) {
      view.isVisible = isVisible
      if (isVisible) {
        if (layer.style.display !== 'block') {
          layer.style.display = 'block'
        }
      } else {
        if (layer.style.display !== 'none') {
          layer.style.display = 'none'
        }
      }
    }
    view.SetVisible(false)
    self.addSubview(view)
  }

  _setup_startObserving () {
    const self = this
    super._setup_startObserving()
    { // walletAppCoordinator
      const emitter = self.context.walletAppCoordinator
      emitter.on(
        emitter.EventName_didTrigger_requestFundsFromContact(), // observe 'did' so we're guaranteed to already be on right tab
        function (contact) {
          self.navigationController.PopToRootView( // essential for the case they're viewing a request…
            true, // animated
            function (err) {
              self.presentCreateRequestFormView_withContact(contact)
            }
          )
        }
      )
    }
  }

  TearDown () {
    const self = this
    super.TearDown()
    // TODO: technically, should stopObserving too
  }

  tearDownAnySpawnedReferencedPresentedViews () { // overridden - called for us
    const self = this
    super.tearDownAnySpawnedReferencedPresentedViews()
    self._teardown_currentlyPresented_CreateRequestFormView()
  }

  _teardown_currentlyPresented_CreateRequestFormView () {
    const self = this
    if (self.currentlyPresented_CreateRequestFormView !== null) {
      self.currentlyPresented_CreateRequestFormView.TearDown() // might not be necessary but method guards itself
      self.currentlyPresented_CreateRequestFormView = null // must zero again and should free
    }
  }

  overridable_listCellViewClass () { // override and return youir
    return FundsRequestsListCellView
  }

  overridable_pushesDetailsViewOnCellTap () {
    return true
  }

  overridable_recordDetailsViewClass (record) {
    const is_displaying_local_wallet = record.is_displaying_local_wallet == true // handle all JS non-true vals
    if (is_displaying_local_wallet) {
      return FundsRequestQRDisplayView // it knows how to handle it, and supports being initialized in the manner of a recordDetailsViewClass (options.record)
    }
    return FundsRequestDetailsView
  }

  //
  //
  // Runtime - Accessors - Navigation
  //
  Navigation_Title () {
    return 'Receive Safex'
  }

  Navigation_New_RightBarButtonView () {
    const self = this
    const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
    view.layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        self.presentCreateRequestFormView_withoutValues()
        return false
      }
    )
    return view
  }

  //
  //
  // Runtime - Imperatives - Modal & details views presentation
  //
  presentCreateRequestFormView_withoutValues () {
    const self = this
    self._presentCreateRequestFormView_withOptions()
  }

  presentCreateRequestFormView_withContact (contact) {
    const self = this
    self._presentCreateRequestFormView_withOptions({
      fromContact: contact
    })
  }

  presentCreateRequestFormView_withWallet (wallet) {
    const self = this
    self._presentCreateRequestFormView_withOptions({
      atWallet: wallet
    })
  }

  _presentCreateRequestFormView_withOptions (options_orNilForDefault) {
    const self = this
    const options = options_orNilForDefault || {}
    if (typeof self.currentlyPresented_CreateRequestFormView === 'undefined' || !self.currentlyPresented_CreateRequestFormView) {
      self.navigationController.PopToRootView(false) // not animated (since we're coming from another tab)
      //
      const view = new CreateRequestFormView(options, self.context)
      self.currentlyPresented_CreateRequestFormView = view
      const navigationView = new StackAndModalNavigationView({}, self.context)
      navigationView.SetStackViews([view])
      self.navigationController.PresentView(navigationView, true)
      //
      return
    }
    const fromContact = options.fromContact
    if (fromContact && typeof fromContact !== 'undefined') {
      self.currentlyPresented_CreateRequestFormView.AtRuntime_reconfigureWith_fromContact(fromContact)
    }
    const atWallet = options.atWallet
    if (atWallet && typeof atWallet !== 'undefined') {
      self.currentlyPresented_CreateRequestFormView.AtRuntime_reconfigureWith_atWallet(atWallet)
    }
  }

  //
  // Runtime - Delegation - UI building
  overridable_willBuildUIWithRecords (records) {
    super.overridable_willBuildUIWithRecords(records)
    //
    const self = this
    // v--- we don't need this here as at present according to design the buttons don't change… just stays the 'Add' btn
    // self.navigationController.SetNavigationBarButtonsNeedsUpdate() // explicit: no animation
    const isEmptyVisible = records.length === 0 && (self.context.passwordController.hasUserSavedAPassword == false || self.context.passwordController.HasUserEnteredValidPasswordYet())
    // ^-- passwordController state checked to avoid improperly showing empty screen when no records loaded but pw not yet entered
    {
      self.emptyStateContainerView.SetVisible(isEmptyVisible)
    }
    { // style cellsContainerView
      const view = self.cellsContainerView
      const layer = view.layer
      if (isEmptyVisible == true) {
        layer.style.display = 'none'
      } else {
        layer.style.margin = '16px 16px 15px 16px'
        layer.style.background = '#383638'
        layer.style.boxShadow = 'inset 0 0.5px 0 0 #494749'
        layer.style.borderRadius = '5px'
        layer.style.overflow = 'hidden' // to cut off hover style at borders
        layer.style.clipPath = 'inset(0 0 0 0 round 5px)' // cause chrome to properly mask children on hover
      }
    }
  }
}
export default FundsRequestsListView
