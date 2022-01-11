'use strict'

import View from '../../Views/View.web'
import commonComponents_navigationBarButtons from '../../MMAppUICommonComponents/navigationBarButtons.web'
import commonComponents_tables from '../../MMAppUICommonComponents/tables.web'
import commonComponents_forms from '../../MMAppUICommonComponents/forms.web'

class EnterNewPasswordView extends View {
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.isForChangingPassword = options.isForChangingPassword
    {
      const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
      if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == '' || typeof userSelectedTypeOfPassword === 'undefined') {
        throw 'ConfigureToBeShown called but userSelectedTypeOfPassword undefined'
      }
      self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
    }
    self.setup()
  }

  setup () {
    const self = this
    self._setup_views()
  }

  _setup_views () {
    const self = this
    self._setup_self_layer()
    self._setup_form()
  }

  _setup_self_layer () {
    const self = this
    const layer = self.layer
    layer.style.backgroundColor = '#272527'
    const paddingTop = 41 // the nav bar height - we should prolly do this on VDA and ask for actual height
    const padding_h = 10
    layer.style.paddingTop = paddingTop + 'px'
    layer.style.width = `calc(100% - ${2 * 14}px)`
    layer.style.paddingLeft = padding_h + 'px'
    layer.style.height = `calc(100% - ${paddingTop}px)`
  }

  _setup_form () {
    const self = this
    self._setup_form_containerLayer()
  }

  _setup_form_containerLayer () {
    const self = this
    const containerLayer = document.createElement('div')
    self.form_containerLayer = containerLayer
    self._setup_form_passwordInputField()
    self._setup_form_confirmPasswordInputField()
    self.layer.appendChild(containerLayer)
  }

  _setup_form_passwordInputField () {
    const self = this
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    div.style.paddingBottom = '10px' // extra spacer
    {
      const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('PIN OR PASSWORD', self.context)
      div.appendChild(labelLayer)
      //
      const layer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
        placeholderText: ''
      })
      layer.type = 'password'
      self.passwordInputLayer = layer
      layer.addEventListener(
        'keyup',
        function (event) {
          self.APasswordFieldInput_did_keyup(event)
        }
      )
      layer.addEventListener(
        'paste',
        function (event) {
          setTimeout(function () {
            self.APasswordFieldInput_did_keyup(event)
          }, 300) // wait a little because value seems not to be readable otherwise
        }
      )
      div.appendChild(layer)
      //
      const messageLayer = commonComponents_forms.New_fieldAccessory_messageLayer(self.context)
      messageLayer.innerHTML = "Used to encrypt your on-device data, and to lock your app when idle. Don't forget it!<br/>Six character&nbsp;minimum."
      div.appendChild(messageLayer)
    }
    self.form_containerLayer.appendChild(div)
    //
    setTimeout(function () {
      self.passwordInputLayer.focus()
    }, 600)
  }

  _setup_form_confirmPasswordInputField () {
    const self = this
    const div = commonComponents_forms.New_fieldContainerLayer(self.context)
    {
      const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer('CONFIRM', self.context)
      div.appendChild(labelLayer)
      //
      const layer = commonComponents_forms.New_fieldValue_textInputLayer(self.context, {
        placeholderText: ''
      })
      layer.type = 'password'
      self.confirmPasswordInputLayer = layer
      layer.addEventListener(
        'keyup',
        function (event) {
          self.APasswordFieldInput_did_keyup(event)
        }
      )
      layer.addEventListener(
        'paste',
        function (event) {
          setTimeout(function () {
            self.APasswordFieldInput_did_keyup(event)
          }, 300) // wait a little because value seems not to be readable otherwise
        }
      )
      div.appendChild(layer)
      //
      const validationMessageLayer = commonComponents_forms.New_fieldAccessory_validationMessageLayer(self.context)
      validationMessageLayer.style.display = 'none'
      self.validationMessageLayer = validationMessageLayer
      div.appendChild(validationMessageLayer)
    }
    self.form_containerLayer.appendChild(div)
  }

  //
  //
  // Runtime - Accessors - Public - Events
  //
  EventName_UserSubmittedNonZeroPassword () {
    return 'EventName_UserSubmittedNonZeroPassword'
  }

  EventName_CancelButtonPressed () {
    return 'EventName_CancelButtonPressed'
  }

  //
  //
  // Runtime - Accessors - Public - Products
  //
  Password () {
    const self = this
    const layer = self.passwordInputLayer
    if (typeof layer === 'undefined' || layer === null) {
      throw 'layer undefined or null in Password()'
      // return ""
    }
    //
    return layer.value
  }

  ConfirmationPassword () {
    const self = this
    const layer = self.confirmPasswordInputLayer
    if (typeof layer === 'undefined' || layer === null) {
      throw 'layer undefined or null in Password()'
      // return ""
    }
    //
    return layer.value
  }

  //
  //
  // Runtime - Accessors - Navigation
  //
  Navigation_Title () {
    const self = this
    if (self.isForChangingPassword === true) {
      return 'New PIN/Password'
    }
    return 'Create PIN/Password'
  }

  Navigation_New_LeftBarButtonView () {
    const self = this
    const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
    const layer = view.layer
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        if (view.isEnabled === true) {
          self.emit(self.EventName_CancelButtonPressed())
        }
        return false
      }
    )
    self.cancelBarButtonView = view
    return view
  }

  Navigation_New_RightBarButtonView () {
    const self = this
    const view = commonComponents_navigationBarButtons.New_RightSide_SaveButtonView(self.context)
    view.layer.innerHTML = 'Next'
    const layer = view.layer
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        if (view.isEnabled === true) {
          self._tryToSubmitForm()
        }
        return false
      }
    )
    self.rightBarButtonView = view
    view.SetEnabled(false) // need to enter PW first
    return view
  }

  //
  //
  // Runtime - Imperatives - Interface - Configuration
  //
  ReEnableSubmittingForm () {
    const self = this
    self.__reEnableForm()
  }

  SetValidationMessage (validationMessageString) {
    const self = this
    if (validationMessageString === '' || !validationMessageString) {
      self.ClearValidationMessage()
      return
    }
    self.confirmPasswordInputLayer.style.border = '1px solid #f97777'
    self.validationMessageLayer.style.display = 'block'
    self.validationMessageLayer.innerHTML = validationMessageString
  }

  ClearValidationMessage () {
    const self = this
    self.confirmPasswordInputLayer.style.border = '1px solid rgba(0,0,0,0)'// todo: factor this into method on component
    self.validationMessageLayer.style.display = 'none'
    self.validationMessageLayer.innerHTML = ''
  }

  //
  //
  // Runtime - Imperatives - Internal
  //
  __disableForm () {
    const self = this
    self.passwordInputLayer.disabled = true
    self.confirmPasswordInputLayer.disabled = true
    self.disable_submitButton()
  }

  __reEnableForm () {
    const self = this
    self.passwordInputLayer.disabled = undefined
    self.confirmPasswordInputLayer.disabled = undefined
    self.passwordInputLayer.focus() // since disable would have de-focused (picking one)
    self.cancelBarButtonView.SetEnabled(true)
    self.enable_submitButton()
  }

  //
  _tryToSubmitForm () {
    const self = this
    const password = self.Password()
    const confirmationPassword = self.ConfirmationPassword()
    if (password !== confirmationPassword) {
      self.SetValidationMessage("Oops, that doesn't match")
      return
    }
    if (confirmationPassword.length < 6) {
      self.SetValidationMessage('Please enter more than 6 characters')
      return
    }
    self.ClearValidationMessage()
    self.__disableForm() // for slow platforms and for change pw
    self.cancelBarButtonView.SetEnabled(false) // for change pw - although the app is hardened against a mishap during this
    self._yield_nonZeroPasswordAndPasswordType()
  }

  _yield_nonZeroPasswordAndPasswordType () {
    const self = this
    self.emit(
      self.EventName_UserSubmittedNonZeroPassword(),
      self.Password()
    )
  }

  //
  // Runtime - Imperatives - Submit button enabled state
  disable_submitButton () {
    const self = this
    if (self.isSubmitButtonDisabled !== true) {
      self.isSubmitButtonDisabled = true
      self.rightBarButtonView.SetEnabled(false)
    }
  }

  enable_submitButton () {
    const self = this
    if (self.isSubmitButtonDisabled !== false) {
      self.isSubmitButtonDisabled = false
      self.rightBarButtonView.SetEnabled(true)
    }
  }

  //
  //
  // Runtime - Delegation - Interactions
  //
  APasswordFieldInput_did_keyup (e) {
    const self = this
    if (e.keyCode === 13) {
      if (self.navigationController.navigationBarView.rightBarButtonView.isEnabled !== false) {
        self._tryToSubmitForm()
      }
    }
    //
    const password = self.Password()
    const confirmationPassword = self.ConfirmationPassword()
    let submitEnabled
    if (typeof password === 'undefined' || password === null || password === '') {
      submitEnabled = false
    } else if (typeof confirmationPassword === 'undefined' || confirmationPassword === null || confirmationPassword === '') {
      submitEnabled = false
    } else {
      submitEnabled = true
    }
    if (submitEnabled) {
      self.enable_submitButton()
    } else {
      self.disable_submitButton()
    }
  }
}
export default EnterNewPasswordView
