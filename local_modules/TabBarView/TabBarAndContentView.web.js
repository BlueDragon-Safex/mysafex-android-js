'use strict'

import View from '../Views/View.web'
import TabBarItemButtonView from './TabBarItemButtonView.web'

class TabBarAndContentView extends View {
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.setup()
  }

  setup () { // If you override this, be sure to call on super first ;)
    const self = this
    const context = self.context
    {
      self._tabBarContentViews = []
      self._tabBarItemButtonViews = []
    }
    {
      const layer = self.layer
      layer.style.position = 'relative'
      layer.style.left = '0px'
      layer.style.right = '0px'
      layer.style.width = '100%'
      layer.style.height = '100%'
    }
    {
      {
        const options = {}
        const view = new View(options, context)
        {
          const layer = view.layer
          layer.style.webkitAppRegion = 'drag' // make draggable
          layer.style.webkitUserSelect = 'none'
          layer.style.position = 'relative'
        }
        self.tabBarView = view
        self.addSubview(view)
      }
      {
        const options = {}
        const view = new View(options, context)
        {
          view.layer.style.overflow = 'hidden' // subviews/layers not allowed to control scroll here - if you want to, you must create your own wrapper
        }
        self.contentAreaView = view
        self.addSubview(view)
      }
    }
    {
      // default behavior is bar on bottom of screen
      {
        const layer = self.tabBarView.layer
        layer.style.position = 'absolute'
        layer.style.top = 'calc(100% - 48px)'
        layer.style.left = '0px'
        layer.style.width = '100%'
        layer.style.height = '48px'
      }
      {
        const layer = self.contentAreaView.layer
        layer.style.position = 'absolute'
        layer.style.top = '0px'
        layer.style.left = '0px'
        layer.style.width = '100%'
        layer.style.height = 'calc(100% - 48px)'
      }
    }
  }

  //
  //
  // Runtime - Accessors - Events
  //
  EventName_triedButAlreadySelectedTabBarItemAtIndex () {
    return 'EventName_triedButAlreadySelectedTabBarItemAtIndex'
  }

  IndexOfTabBarContentView (tabBarContentView) {
    const self = this
    const index = self._tabBarContentViews.indexOf(tabBarContentView)
    if (index === -1) {
      throw 'tabBarContentView not found in tabs'
    }
    return index
  }

  CurrentlySelectedTabBarContentView () {
    const self = this
    if (typeof self._currentlySelectedTabBarItemIndex === 'undefined' || self._currentlySelectedTabBarItemIndex === -1) {
      return null
    }
    return self._tabBarContentViews[self._currentlySelectedTabBarItemIndex]
  }

  //
  //
  // Runtime - Imperatives - View setup
  //
  SetTabBarContentViews (to_tabBarContentViews) {
    const self = this
    const context = self.context
    { // remove and free existing; rebuild arrays
      { // _tabBarContentViews
        self._tabBarContentViews.forEach(
          function (view, idx) {
            if (view.HasASuperview() === true) {
              view.removeFromSuperview()
            }
          }
        )
        self._tabBarContentViews = []
      }
      { // _tabBarItemButtonViews
        self._tabBarItemButtonViews.forEach(
          function (view, idx) {
            view.removeFromSuperview()
          }
        )
        self._tabBarItemButtonViews = []
      }
    }
    { // add tab bar item button views, and new tabBarContentViews
      const isHorizontalBar = true
      const numberOf_tabs = to_tabBarContentViews.length
      to_tabBarContentViews.forEach(
        function (to_tabBarContentView, idx) {
          let layer_baseStyleTemplate = {}
          {
            const lookup_fn = to_tabBarContentView.TabBarItem_layer_customStyle
            if (typeof lookup_fn === 'function') {
              const style = lookup_fn.apply(to_tabBarContentView, [isHorizontalBar])
              if (style && typeof style !== 'undefined') {
                layer_baseStyleTemplate = style
              }
            }
          }
          let icon_baseStyleTemplate = {}
          {
            const lookup_fn = to_tabBarContentView.TabBarItem_icon_customStyle
            if (typeof lookup_fn === 'function') {
              const style = lookup_fn.apply(to_tabBarContentView, [isHorizontalBar])
              if (style && typeof style !== 'undefined') {
                icon_baseStyleTemplate = style
              }
            }
          }
          let icon_selected_baseStyleTemplate = {}
          {
            const lookup_fn = to_tabBarContentView.TabBarItem_icon_selected_customStyle
            if (typeof lookup_fn === 'function') {
              const style = lookup_fn.apply(to_tabBarContentView, [isHorizontalBar])
              if (style && typeof style !== 'undefined') {
                icon_selected_baseStyleTemplate = style
              }
            }
          }
          { // buttonView
            const options =
						{
						  isHorizontalBar: isHorizontalBar,
						  layer_baseStyleTemplate: layer_baseStyleTemplate,
						  icon_baseStyleTemplate: icon_baseStyleTemplate,
						  icon_selected_baseStyleTemplate: icon_selected_baseStyleTemplate,
						  numberOf_tabs: numberOf_tabs
						}
            const buttonView = new TabBarItemButtonView(options, context)
            buttonView.on(
              buttonView.EventName_clicked(),
              function (tabBarItemButtonView) {
                const index = self._tabBarItemButtonViews.indexOf(tabBarItemButtonView)
                if (index === -1) {
                  throw 'heard tab bar item outside of list clicked'
                }
                self.SelectTabBarItemAtIndex(index)
              }
            )
            self._tabBarItemButtonViews.push(buttonView)
            self.tabBarView.addSubview(buttonView)
          }
          { // and hang onto the content view itself
            self._tabBarContentViews.push(to_tabBarContentView)
          }
        }
      )
    }
    { // select first tab bar item
      if (to_tabBarContentViews.length > 0) {
        self.SelectTabBarItemAtIndex(0)
      }
    }
  }

  //
  //
  // Runtime - Imperatives - Item selection
  //
  SelectTabBarItemAtIndex (index) { // throws
    const self = this
    {
      if (typeof index === 'undefined' || index === null) {
        throw 'index nil'
      }
      if (index < 0) {
        throw 'index too small'
      }
      if (index >= self._tabBarContentViews.length) {
        throw 'index too great'
      }
    }
    const buttonView_forIndex = self._tabBarItemButtonViews[index]
    if (buttonView_forIndex.isEnabled == false) {
      alert('DISABLED')
      console.warn('Asked to SelectTabBarItemAtIndex(index) but it was disabled.')
      return
    }
    {
      if (index === self._currentlySelectedTabBarItemIndex) { // we already know index isn't going to be undefined or null here
        const detailView_forCurrentlySelectedItemIndex = self._tabBarContentViews[self._currentlySelectedTabBarItemIndex]
        // ^ so we can assume the existence of a detailView
        // console.warn("Already selected index", index)
        self.emit(self.EventName_triedButAlreadySelectedTabBarItemAtIndex(), index)
        { // call special / TabBarAndContentView double-tap notification function if detail view implements it
          const TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected_fn = detailView_forCurrentlySelectedItemIndex.TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected
          if (typeof TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected_fn === 'function') {
            // make sure we notify the detail view, so that, e.g. if a StackNavigationView, it can PopToRoot
            detailView_forCurrentlySelectedItemIndex.TabBarAndContentView_tabBarItemForThisContentViewWasDoubleSelected()
          }
        }
        return
      }
    }
    { // neutralize existing state
      if (typeof self._currentlySelectedTabBarItemIndex !== 'undefined' && self._currentlySelectedTabBarItemIndex !== null) {
        // deselect currently selected
        {
          const detailView_forCurrentlySelectedItemIndex = self._tabBarContentViews[self._currentlySelectedTabBarItemIndex] // we did the validation when we set the index
          try {
            detailView_forCurrentlySelectedItemIndex.removeFromSuperview()
          } catch (e) {
            console.error('Exception:', e, e.stack)
            console.trace()
            return
          }
        }
        {
          const buttonView_forCurrentlySelectedItemIndex = self._tabBarItemButtonViews[self._currentlySelectedTabBarItemIndex]
          buttonView_forCurrentlySelectedItemIndex.Deselect()
        }
      }
    }
    { // set state
      self._currentlySelectedTabBarItemIndex = index
    }
    { // config UI with new state
      {
        const detailView_forIndex = self._tabBarContentViews[index]
        {
          detailView_forIndex.layer.style.width = '100%'
          detailView_forIndex.layer.style.height = '100%'
        }
        self.contentAreaView.addSubview(detailView_forIndex)
      }
      {
        const buttonView_forIndex = self._tabBarItemButtonViews[index]
        buttonView_forIndex.Select()
      }
    }
  }

  //
  //
  // Runtime - Imperatives - Hierarchy management convenience functions
  //
  ResetAllTabContentViewsToRootState (isAnimated_orFalse) {
    const self = this
    let isAnimated
    {
      isAnimated = isAnimated_orFalse === true // aka default false unless non-nil and true
    }
    self._tabBarContentViews.forEach(
      function (view, idx) {
        const TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState_fn = view.TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState
        if (typeof TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState_fn === 'function') {
          view.TabBarAndContentView_wasToldToResetAllTabContentViewsToRootState(isAnimated)
        }
      }
    )
  }

  //
  //
  // Runtime - Imperatives - Convenience - Interactivity management
  //
  EnableTabBarItemButtons () {
    const self = this
    self._tabBarItemButtonViews.forEach(
      function (view, idx) {
        view.Enable()
      }
    )
  }

  DisableTabBarItemButtons () {
    const self = this
    self._tabBarItemButtonViews.forEach(
      function (view, idx) {
        view.Disable()
      }
    )
  }

  SetTabBarItemButtonsInteractivityNeedsUpdateFromProviders () {
    const self = this
    self._tabBarItemButtonViews.forEach(
      function (view, idx) {
        const contentView = self._tabBarContentViews[idx]
        if (typeof contentView.TabBarItem_shallDisable === 'function') {
          const shallDisable = contentView.TabBarItem_shallDisable()
          if (shallDisable == false) {
            view.Enable()
          } else {
            view.Disable()
          }
        } else {
          view.Enable() // default
        }
      }
    )
  }
}
export default TabBarAndContentView
