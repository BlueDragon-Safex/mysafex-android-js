'use strict'

import ListCellView from '../../Lists/Views/ListCellView.web'
import commonComponents_tables from '../../MMAppUICommonComponents/tables.web'
import commonComponents_hoverableCells from '../../MMAppUICommonComponents/hoverableCells.web'
import emoji_web from '../../Emoji/emoji_web'
import Views__cssRules from '../../Views/cssRules.web'

const NamespaceName = 'ContactsListCellView'
const haveCSSRulesBeenInjected_documentKey = '__haveCSSRulesBeenInjected_' + NamespaceName
const cssRules =
[
	`.${NamespaceName} .emoji-label {
	}`,
	`.${NamespaceName} .emoji-label .emojione {
		transform: scale(.5);
		margin-left: -7px;
		margin-top: -6px;
	}`
]
function __injectCSSRules_ifNecessary () { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
class ContactsListCellView extends ListCellView {
  constructor (options, context) {
    super(options, context)
  }

  setup_views () {
    const self = this
    super.setup_views()
    __injectCSSRules_ifNecessary()
    self.layer.classList.add(NamespaceName)
    self.layer.style.position = 'relative'
    self.layer.style.padding = '19px 0 7px 0'
    { // hover effects/classes
      self.layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
      self.layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
    }
    self.__setup_emojiLayer()
    self.__setup_nameLayer()
    self.__setup_addressLayer()
    self.layer.appendChild(commonComponents_tables.New_tableCell_accessoryChevronLayer(self.context))
    self.__setup_cellSeparatorLayer()
  }

  __setup_emojiLayer () {
    const self = this
    const layer = document.createElement('span')
    layer.classList.add('emoji-label')
    layer.style.position = 'absolute'
    layer.style.left = '16px'
    layer.style.top = '20px'
    layer.style.fontSize = '13px'
    layer.style.color = '#9e9c9e'
    layer.style.cursor = 'default'
    self.emojiLayer = layer
    self.layer.appendChild(layer)
  }

  __setup_nameLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.position = 'relative'
    layer.style.margin = '0 66px 4px 50px'
    layer.style.height = 'auto'
    layer.style.fontSize = '13px'
    layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    layer.style.fontWeight = '400'
    layer.style.wordBreak = 'break-word'
    layer.style.whiteSpace = 'nowrap'
    layer.style.overflow = 'hidden'
    layer.style.textOverflow = 'ellipsis'
    layer.style.color = '#fcfbfc'
    layer.style.cursor = 'default'
    self.nameLayer = layer
    self.layer.appendChild(layer)
  }

  __setup_addressLayer () {
    const self = this
    const layer = document.createElement('div')
    layer.style.position = 'relative'
    layer.style.margin = '0 66px 4px 50px'
    layer.style.fontSize = '13px'
    layer.style.fontFamily = 'Native-Light, input, menlo, monospace'
    layer.style.fontWeight = '100'
    layer.style.height = '20px'
    layer.style.color = '#9e9c9e'
    layer.style.whiteSpace = 'nowrap'
    layer.style.overflow = 'hidden'
    layer.style.textOverflow = 'ellipsis'
    layer.style.cursor = 'default'
    self.addressLayer = layer
    self.layer.appendChild(layer)
  }

  __setup_cellSeparatorLayer () {
    const self = this
    const layer = commonComponents_tables.New_tableCell_separatorLayer()
    self.cellSeparatorLayer = layer
    self.layer.appendChild(layer)
  }

  overridable_startObserving_record () {
    const self = this
    super.overridable_startObserving_record()
    //
    if (typeof self.record === 'undefined' || self.contact === null) {
      throw 'self.record undefined in start observing'
    }
    // here, we're going to store a bunch of functions as instance properties
    // because if we need to stopObserving we need to have access to the listener fns
    const emitter = self.record
    self.contact_EventName_contactInfoUpdated_listenerFunction = function () {
      self.overridable_configureUIWithRecord()
    }
    emitter.on(
      emitter.EventName_contactInfoUpdated(),
      self.contact_EventName_contactInfoUpdated_listenerFunction
    )
  }

  overridable_stopObserving_record () {
    const self = this
    super.overridable_stopObserving_record()
    //
    if (typeof self.record === 'undefined' || !self.record) {
      return
    }
    const emitter = self.record
    function doesListenerFunctionExist (fn) {
      if (typeof fn !== 'undefined' && fn !== null) {
        return true
      }
      return false
    }
    if (doesListenerFunctionExist(self.contact_EventName_contactInfoUpdated_listenerFunction) === true) {
      emitter.removeListener(
        emitter.EventName_contactInfoUpdated(),
        self.contact_EventName_contactInfoUpdated_listenerFunction
      )
    }
  }

  overridable_configureUIWithRecord () {
    super.overridable_configureUIWithRecord()
    //
    const self = this
    if (self.isAtEnd == true) {
      self.cellSeparatorLayer.style.visibility = 'hidden'
    } else {
      self.cellSeparatorLayer.style.visibility = 'visible'
    }
    if (typeof self.record === 'undefined' || !self.record) {
      self.emojiLayer.innerHTML = ''
      self.nameLayer.innerHTML = ''
      self.addressLayer.innerHTML = ''
      return
    }
    if (self.record.didFailToInitialize_flag === true || self.record.didFailToBoot_flag === true) { // unlikely, but possible
      self.emojiLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
        self.context,
        '❌'
      )
      self.nameLayer.innerHTML = 'Error: Please contact support.'
      self.addressLayer.innerHTML = self.record.didFailToBoot_errOrNil ? ' ' + self.record.didFailToBoot_errOrNil : ''
      return
    }
    self.emojiLayer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(
      self.context,
      self.record.emoji
    )
    self.nameLayer.innerHTML = self.record.fullname
    self.addressLayer.innerHTML = self.record.address
    // self.DEBUG_BorderAllLayers()
  }
}
export default ContactsListCellView
