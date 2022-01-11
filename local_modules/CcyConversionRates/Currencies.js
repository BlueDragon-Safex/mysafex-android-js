'use strict'

import safex_config from '@mysafex/mysafex-safex-config'
import safex_amount_format_utils from '@mysafex/mysafex-money-format'

const ccySymbolsByCcy =
{
  XMR: 'XMR', // included for completeness / convenience / API
  USD: 'USD',
  AUD: 'AUD',
  BRL: 'BRL',
  CAD: 'CAD',
  CHF: 'CHF',
  CNY: 'CNY',
  EUR: 'EUR',
  GBP: 'GBP',
  HKD: 'HKD',
  INR: 'INR',
  JPY: 'JPY',
  KRW: 'KRW',
  MXN: 'MXN',
  NOK: 'NOK',
  NZD: 'NZD',
  SEK: 'SEK',
  SGD: 'SGD',
  TRY: 'TRY',
  RUB: 'RUB',
  ZAR: 'ZAR'
}
const allOrderedCurrencySymbols =
[
  ccySymbolsByCcy.XMR, // included for completeness / convenience / API
  ccySymbolsByCcy.USD,
  ccySymbolsByCcy.AUD,
  ccySymbolsByCcy.BRL,
  ccySymbolsByCcy.CAD,
  ccySymbolsByCcy.CHF,
  ccySymbolsByCcy.CNY,
  ccySymbolsByCcy.EUR,
  ccySymbolsByCcy.GBP,
  ccySymbolsByCcy.HKD,
  ccySymbolsByCcy.INR,
  ccySymbolsByCcy.JPY,
  ccySymbolsByCcy.KRW,
  ccySymbolsByCcy.MXN,
  ccySymbolsByCcy.NOK,
  ccySymbolsByCcy.NZD,
  ccySymbolsByCcy.SEK,
  ccySymbolsByCcy.SGD,
  ccySymbolsByCcy.TRY,
  ccySymbolsByCcy.RUB,
  ccySymbolsByCcy.ZAR
]
const hasAtomicUnits = function (ccySymbol) {
  return (ccySymbol == ccySymbolsByCcy.XMR)
}
const unitsForDisplay = function (ccySymbol) {
  if (ccySymbol == ccySymbolsByCcy.XMR) {
    return safex_config.coinUnitPlaces
  }
  return 2
}
const nonAtomicCurrency_formattedString = function (
  final_amountDouble, // final as in display-units-rounded - will throw if amount has too much precision
  ccySymbol
) { // -> String
  // is nonAtomic-unit'd currency a good enough way to categorize these?
  if (ccySymbol == ccySymbolsByCcy.XMR) {
    throw 'nonAtomicCurrency_formattedString not to be called with ccySymbol=.XMR'
  }
  if (final_amountDouble == 0) {
    return '0' // not 0.0
  }
  const naiveString = `${final_amountDouble}`
  const components = naiveString.split('.')
  const components_length = components.length
  if (components_length <= 0) {
    throw 'Unexpected 0 components while formatting nonatomic currency'
  }
  if (components_length == 1) { // meaning there's no '.'
    if (naiveString.indexOf('.') != -1) {
      throw "one component but no '.' character"
    }
    return naiveString + '.00'
  }
  if (components_length != 2) {
    throw 'expected components_length=' + components_length
  }
  const component_1 = components[0]
  const component_2 = components[1]
  const component_2_str_length = component_2.length
  const currency_unitsForDisplay = unitsForDisplay(ccySymbol)
  if (component_2_str_length > currency_unitsForDisplay) {
    throw 'expected component_2_characters_count<=currency_unitsForDisplay'
  }
  const requiredNumberOfZeroes = currency_unitsForDisplay - component_2_str_length
  let rightSidePaddingZeroes = ''
  if (requiredNumberOfZeroes > 0) {
    for (let i = 0; i < requiredNumberOfZeroes; i++) {
      rightSidePaddingZeroes += '0' // TODO: less verbose way to do this?
    }
  }
  return component_1 + '.' + component_2 + rightSidePaddingZeroes // pad
}
function roundTo (num, digits) {
  return +(Math.round(num + 'e+' + digits) + 'e-' + digits)
}

const submittableSafexAmountDouble_orNull = function (
  CcyConversionRates_Controller_shared,
  selectedCurrencySymbol,
  submittableAmountRawNumber_orNull // passing null causes immediate return of null
) { // -> Double?
  // conversion approximation will be performed from user input
  if (submittableAmountRawNumber_orNull == null) {
    return null
  }
  const submittableAmountRawNumber = submittableAmountRawNumber_orNull
  if (selectedCurrencySymbol == ccySymbolsByCcy.XMR) {
    return submittableAmountRawNumber // identity rate - NOTE: this is also the RAW non-truncated amount
  }
  const xmrAmountDouble = rounded_ccyConversionRateCalculated_safexAmountNumber(
    CcyConversionRates_Controller_shared,
    submittableAmountRawNumber,
    selectedCurrencySymbol
  )
  return xmrAmountDouble
}

const rounded_ccyConversionRateCalculated_safexAmountNumber = function (
  CcyConversionRates_Controller_shared,
  userInputAmountJSNumber,
  selectedCurrencySymbol
) { // -> Double? // may return nil if ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
  const xmrToCurrencyRate = CcyConversionRates_Controller_shared.rateFromXMR_orNullIfNotReady(
    selectedCurrencySymbol
  )
  if (xmrToCurrencyRate == null) {
    return null // ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
  }
  // conversion:
  // currencyAmt = xmrAmt * xmrToCurrencyRate;
  // xmrAmt = currencyAmt / xmrToCurrencyRate.
  // I figure it's better to apply the rounding here rather than only at the display level so that what is actually sent corresponds to what the user saw, even if greater ccyConversion precision /could/ be accomplished..
  const raw_ccyConversionRateApplied_amount = userInputAmountJSNumber * (1 / xmrToCurrencyRate)
  const truncated_amount = roundTo(raw_ccyConversionRateApplied_amount, 4) // must be truncated for display purposes
  if (isNaN(truncated_amount)) {
    throw 'truncated_amount in rounded_ccyConversionRateCalculated_safexAmountNumber is NaN'
  }
  //
  return truncated_amount
}
const displayUnitsRounded_amountInCurrency = function ( // Note: __DISPLAY__ units
  CcyConversionRates_Controller_shared,
  ccySymbol,
  safexAmountNumber // NOTE: 'Double' JS Number, not JS BigInt
) { // -> Double?
  if (typeof safexAmountNumber !== 'number') {
    throw 'unexpected typeof safexAmountNumber=' + (typeof safexAmountNumber)
  }
  if (ccySymbol == ccySymbolsByCcy.XMR) {
    return safexAmountNumber // no conversion necessary
  }
  const xmrToCurrencyRate = CcyConversionRates_Controller_shared.rateFromXMR_orNullIfNotReady(
    ccySymbol // toCurrency
  )
  if (xmrToCurrencyRate == null) {
    return null // ccyConversion rate unavailable - consumers will try again
  }
  const currency_unitsForDisplay = unitsForDisplay(ccySymbol)
  const raw_ccyConversionRateApplied_amountNumber = safexAmountNumber * xmrToCurrencyRate
  const truncated_amount = roundTo(raw_ccyConversionRateApplied_amountNumber, currency_unitsForDisplay) // must be truncated for display purposes
  //
  return truncated_amount
}

//
const displayStringComponentsFrom = function (
  CcyConversionRates_Controller_shared,
  xmr_amount_JSBigInt,
  displayCcySymbol
) {
  const XMR = ccySymbolsByCcy.XMR
  const xmr_amount_str = safex_amount_format_utils.formatMoney(xmr_amount_JSBigInt)
  if (displayCcySymbol != XMR) {
    // TODO: using doubles here is not very good, and must be replaced with JSBigInts to support small amounts
    const xmr_amount_double = parseFloat(xmr_amount_str)
    //
    const displayCurrencyAmountDouble_orNull = displayUnitsRounded_amountInCurrency(
      CcyConversionRates_Controller_shared,
      displayCcySymbol,
      xmr_amount_double
    )
    if (displayCurrencyAmountDouble_orNull != null) { // rate is ready
      const displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
      const displayFormattedAmount = nonAtomicCurrency_formattedString(
        displayCurrencyAmountDouble,
        displayCcySymbol
      )
      return {
        amt_str: displayFormattedAmount,
        ccy_str: displayCcySymbol
      }
    } else {
      // rate is not ready, so wait for it by falling through to display XMR:
    }
  }
  return {
    amt_str: xmr_amount_str,
    ccy_str: XMR
  } // special case
}

export default {
  ccySymbolsByCcy,
  allOrderedCurrencySymbols,
  displayStringComponentsFrom,
  displayUnitsRounded_amountInCurrency,
  rounded_ccyConversionRateCalculated_safexAmountNumber,
  nonAtomicCurrency_formattedString,
  submittableSafexAmountDouble_orNull,
  unitsForDisplay,
  hasAtomicUnits
}
