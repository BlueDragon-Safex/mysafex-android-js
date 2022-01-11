// "use strict"

import View from '../../Views/View.web'
import commonComponents_navigationBarButtons from '../../MMAppUICommonComponents/navigationBarButtons.web'
import { BigInteger as JSBigInt } from '@mysafex/mysafex-bigint' // important: grab defined expo
import safex_amount_format_utils from '@mysafex/mysafex-money-format'
import ExchangeUtils from '../../Exchange/Javascript/ExchangeUtilityFunctions'
//import ExchangeLibrary from 'mysafex-exchange';
//import ValidationLibrary from 'wallet-address-validator';
import ExchangeHelper from '@mysafex/mysafex-exchange-helper'
import PageTemplates from '@mysafex/mysafex-page-templates';
const ExchangeLandingPage = PageTemplates.ExchangeLandingPage
let exchangeHelper = new ExchangeHelper()

let handleOfferError = exchangeHelper.errorHelper.handleOfferError


function newEstimatedNetworkFeeString (fee_JSBigInt) {
  const self = this
  const estimatedTotalFee_JSBigInt = fee_JSBigInt
    const estimatedTotalFee_str = safex_amount_format_utils.formatMoney(estimatedTotalFee_JSBigInt)
  const estimatedTotalFee_safexAmountDouble = parseFloat(estimatedTotalFee_str)

  // const estimatedTotalFee_safexAmountDouble = 0.028
  // Just hard-coding this to a reasonable estimate for now as the fee estimator algo uses the median blocksize which results in an estimate about twice what it should be
  // const displayCcySymbol = self.context.settingsController.displayCcySymbol
  // const finalizable_ccySymbol = displayCcySymbol
  const finalizable_formattedAmountString = estimatedTotalFee_str// `${estimatedTotalFee_safexAmountDouble}`
  const final_formattedAmountString = finalizable_formattedAmountString
  const final_ccySymbol = 'XMR'
  const displayString = `${final_formattedAmountString}`
  //
  return displayString
}
class ExchangeContentView extends View {
  constructor (options, context) {
    // Can we deterministically add an event listener to clicks on the Exchange tab?

    super(options, context)
    const ecvSelf = this
    const self = context

    //
    const view = new View({}, self.context)
    const layer = view.layer
    const margin_side = 16
    const marginTop = 56
    layer.style.marginTop = `${marginTop}px`
    layer.style.marginLeft = margin_side + 'px'
    layer.style.width = `calc(100% - ${2 * margin_side}px)`
    layer.style.height = `calc(100% - ${marginTop}px - 15px)`

    ecvSelf._setup_emptyStateContainerView(context)
    ecvSelf.observerIsSet = false
  }

  _setup_views () {
    const self = this
    // self._refresh_sending_fee();
    console.log('Setup view stuff')
    }

  // New refactored
  _setup_tabButtonClickListener (context) {
    const self = this
      let tabElement = document.getElementById('tabButton-exchange')
      //tabElement.addEventListener('click', self.renderExchangeForm.bind(context))
    }

  // New refactored
  renderExchangeForm (context) {
    // Let's check whether we're unlocked, and if yes, refresh the wallet selector
    const self = this
    if (self.walletsListController.records.length > 0) {
      const walletHtml = exchangeHelper.walletSelectorTemplate(self)
      const walletSelector = document.getElementById('wallet-selector')
        walletSelector.innerHTML = walletHtml
      }
  }

  _setup_emptyStateContainerView (context) {
    // TODO: wrap this in a promise so that we can execute logic after this
    console.log(context)
      const self = this
    self.exchangeFormTemplate = exchangeHelper.htmlFormTemplate()
      let parentElementToAttachListenerTo = document.getElementById('tabButton-exchange')
      // We need to refactor this to update a template
      const initialExchangeInit = setInterval(() => {
      // We can't guarantee the existence of the tabButton-exchange div because of how the page loads, so we wrap it in an interval that fires as soon as the render is done
      const parentElementToAttachListenerTo = document.getElementById('tabButton-exchange')
        if (parentElementToAttachListenerTo !== null) {
        self._setup_tabButtonClickListener(self.context)
          clearInterval(self.initialExchangeInit)
      }
    }, 200)

    self.initialExchangeInit = initialExchangeInit

    const view = new View({}, self.context)
    {
      const layer = view.layer
      layer.classList.add('emptyScreens')
      layer.classList.add('exchangeScreen')
      layer.classList.add('exchange-page-panel')
      layer.id = 'exchange-content-container'
    }
    let contentContainerLayer
    {
      const layer = document.createElement('div')
      layer.classList.add('content-container')
      layer.classList.add('empty-page-content-container')
      view.layer.appendChild(layer)
      contentContainerLayer = layer
    }

    {
      const layer = document.createElement('div')
      layer.classList.add('message-label')
      layer.classList.add('exchangeRate')
      layer.id = 'explanatory-message'
      const subLayer = document.createElement('exchange-landing-page')
        subLayer.context = self.context
        console.log(self)
        console.log(context)
        console.log(subLayer)
        layer.appendChild(subLayer)
  
        contentContainerLayer.appendChild(layer)
    }

    // {
    //   // Send Funds
    //   const layer = document.createElement('div')
    //   // we use ES6's spread operator (...buttonClasses) to invoke the addition of classes -- cleaner than a foreach
    //   const buttonClasses = ['base-button', 'hoverable-cell', 'navigation-blue-button-enabled', 'action', 'right-add-button', 'exchange-button']
    //   layer.classList.add(...buttonClasses)
    //   layer.id = 'exchange-xmr'
    //   layer.innerText = 'Exchange XMR'
    //   const orderSent = false
    //   layer.addEventListener('click', function (orderSent) {
    //     function cancelled_fn () { // canceled_fn
    //     // No cancel handler code since we don't provide a cancel method
    //     }

    //     const exchangePageDiv = document.getElementById('exchangePage')

    //     let sendFunds = ExchangeUtils.sendFunds;

    //     const in_amount = document.getElementById('in_amount_remaining').innerHTML
    //     const send_address = document.getElementById('receiving_subaddress').innerHTML
    //     const in_amount_str = '' + in_amount

    //     const selectedWallet = document.getElementById('selected-wallet')
    //     const selectorOffset = selectedWallet.dataset.walletoffset
    //     const sweep_wallet = false // TODO: Add sweeping functionality
    //     try {
    //       if (context.walletsListController.hasOwnProperty('orderSent')) {
    //         console.log('Order already sent previously')
    //         return;
    //       } else {
    //         context.walletsListController.orderSent = false
    //       }

    //       sendFunds(context.walletsListController.records[0], in_amount, send_address, sweep_wallet, exchangeHelper.sendFundsValidationStatusCallback, exchangeHelper.handleSendFundsResponseCallback, context)
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   })

    //   contentContainerLayer.appendChild(layer)
    // }
    // {
    //   // let's make the xmr.to form in HTML for sanity's sake
    //   const layer = document.createElement('div')
    //   // layer.classList.add("xmr_input");
    //   // We clone the first element of the template so that we get an instance of the first element, rather than a document fragment. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
    //   let html = self.exchangeFormTemplate.content.firstElementChild.cloneNode(true);
    //   layer.appendChild(html)
    //   contentContainerLayer.appendChild(layer)
    // }

    const e = document.getElementById('exchangePage')
      self.emptyStateMessageContainerView = view
    self.addSubview(view)

    // const a = document.getElementById('server-invalid')
    setTimeout(() => {
      const tabElement = document.getElementById('tabButton-exchange')
        tabElement.addEventListener('click', () => {
        exchangeHelper.doInit(context)
        })
        // after init, the localsafex link would exist, so we can bind to it
      }, 500)
  }

  Navigation_Title () {
    return 'Exchange'
  }

  Navigation_New_RightBarButtonView () {
    const self = this
    //
    const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
    // const view = _New_ButtonBase_View(context)
    const layer = view.layer
    { // setup/style
      layer.href = '' // to make it non-clickable -- KB: Or you could event.preventDefault..., like sane people?
      layer.innerHTML = 'Create Order'
      layer.id = 'order-button'
      layer.classList.add('exchange-button')
      layer.classList.add('base-button')
      layer.classList.add('hoverable-cell')
      layer.classList.add('navigation-blue-button-enabled')
      layer.classList.add('action')
      if (typeof process !== 'undefined' && process.platform === 'linux') {
        layer.style.fontWeight = '700' // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
      } else {
        layer.style.fontWeight = '300'
      }
    }
    // Candidate for deletion -- we don't need a top right button on the landing page
    // return view
  }
}

export default ExchangeContentView

