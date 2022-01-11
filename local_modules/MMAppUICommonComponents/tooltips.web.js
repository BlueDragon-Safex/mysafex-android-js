'use strict'

import Opentip from './Vendor/opentip-native.min.js'
import commonComponents_tables from './tables.web'
import Views__cssRules from '../Views/cssRules.web'

const NamespaceName = 'tooltips'
const haveCSSRulesBeenInjected_documentKey = '__haveCSSRulesBeenInjected_' + NamespaceName
const cssRules =
[
	// from opentip:
	`.opentip-container,
	.opentip-container * {
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
	}`,
	`.opentip-container {
		position: absolute;
		max-width: 300px;
		z-index: 100;
		transition: transform 1s ease-in-out;
		pointer-events: none;
		transform: translateX(0) translateY(0);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-top.stem-center,
	.opentip-container.ot-fixed.ot-going-to-show.stem-top.stem-center,
	.opentip-container.ot-fixed.ot-hiding.stem-top.stem-center {
		transform: translateY(-5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-top.stem-right,
	.opentip-container.ot-fixed.ot-going-to-show.stem-top.stem-right,
	.opentip-container.ot-fixed.ot-hiding.stem-top.stem-right {
		transform: translateY(-5px) translateX(5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-middle.stem-right,
	.opentip-container.ot-fixed.ot-going-to-show.stem-middle.stem-right,
	.opentip-container.ot-fixed.ot-hiding.stem-middle.stem-right {
		transform: translateX(5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-bottom.stem-right,
	.opentip-container.ot-fixed.ot-going-to-show.stem-bottom.stem-right,
	.opentip-container.ot-fixed.ot-hiding.stem-bottom.stem-right {
		transform: translateY(5px) translateX(5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-bottom.stem-center,
	.opentip-container.ot-fixed.ot-going-to-show.stem-bottom.stem-center,
	.opentip-container.ot-fixed.ot-hiding.stem-bottom.stem-center {
		transform: translateY(5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-bottom.stem-left,
	.opentip-container.ot-fixed.ot-going-to-show.stem-bottom.stem-left,
	.opentip-container.ot-fixed.ot-hiding.stem-bottom.stem-left {
		transform: translateY(5px) translateX(-5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-middle.stem-left,
	.opentip-container.ot-fixed.ot-going-to-show.stem-middle.stem-left,
	.opentip-container.ot-fixed.ot-hiding.stem-middle.stem-left {
		transform: translateX(-5px);
	}`,
	`.opentip-container.ot-fixed.ot-hidden.stem-top.stem-left,
	.opentip-container.ot-fixed.ot-going-to-show.stem-top.stem-left,
	.opentip-container.ot-fixed.ot-hiding.stem-top.stem-left {
		transform: translateY(-5px) translateX(-5px);
	}`,
	`.opentip-container.ot-fixed .opentip {
		pointer-events: auto;
	}`,
	`.opentip-container.ot-hidden {
		display: none;
	}`,
	`.opentip-container .opentip {
		position: relative;
		font-size: 13px;
		line-height: 120%;
		padding: 9px 14px;
		color: #4f4b47;
		text-shadow: -1px -1px 0px rgba(255,255,255,0.2);
	}`,
	`.opentip-container .opentip .header {
		margin: 0;
		padding: 0;
	}`,
	`.opentip-container .opentip .ot-close {
		pointer-events: auto;
		display: block;
		position: absolute;
		top: -12px;
		left: 60px;
		color: rgba(0,0,0,0.5);
		background: rgba(0,0,0,0);
		text-decoration: none;
	}`,
	`.opentip-container .opentip .ot-close span {
		display: none;
	}`,
	`.opentip-container .opentip .ot-loading-indicator {
		display: none;
	}`,
	`.opentip-container.ot-loading .ot-loading-indicator {
		width: 30px;
		height: 30px;
		font-size: 30px;
		line-height: 30px;
		font-weight: bold;
		display: block;
	}`,
	`.opentip-container.ot-loading .ot-loading-indicator span {
		display: block;
		animation: otloading 2s linear infinite;
		text-align: center;
	}`,
	`.opentip-container.style-dark .opentip,
	.opentip-container.style-alert .opentip {
		color: #f8f8f8;
		text-shadow: 1px 1px 0px rgba(0,0,0,0.2);
	}`,
	`.opentip-container.style-glass .opentip {
		padding: 15px 25px;
		color: #317cc5;
		text-shadow: 1px 1px 8px rgba(0,94,153,0.3);
	}`,
	`.opentip-container.ot-hide-effect-fade {
		transition: transform 0.5s ease-in-out, opacity 1s ease-in-out;
		opacity: 1;
		filter: none;
	}`,
	`.opentip-container.ot-hide-effect-fade.ot-hiding {
		opacity: 0;
		filter: alpha(opacity=0);
	}`,
	`.opentip-container.ot-show-effect-appear.ot-going-to-show,
	.opentip-container.ot-show-effect-appear.ot-showing {
		transition: transform 0.5s ease-in-out, opacity 1s ease-in-out;
	}`,
	`.opentip-container.ot-show-effect-appear.ot-going-to-show {
		opacity: 0;
		filter: alpha(opacity=0);
	}`,
	`.opentip-container.ot-show-effect-appear.ot-showing {
		opacity: 1;
		filter: none;
	}`,
	`.opentip-container.ot-show-effect-appear.ot-visible {
		opacity: 1;
		filter: none;
	}`,
	`@-webkit-keyframes otloading {
		0% {
		transform: rotate(0deg);
		}
		100% {
		transform: rotate(360deg);
		}
	}`,
	//
	// customizations
	`.opentip-container .opentip {
		padding: 8px 8px 10px 8px;

		box-shadow: inset 0 0.5px 0 0 #FFFFFF;
		border-radius: 5px; /* must be set or we get extra pxs */

		font-size: 11px;
		line-height: 14px;
		color: #161416;
		font-weight: normal;
		-webkit-font-smoothing: subpixel-antialiased;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
	}`

]
function __injectCSSRules_ifNecessary () { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function _once_listenForTouchStartToDismissTooltip () {
  const documentKey = NamespaceName + '_did_listenForMobileNonHoveringEventsToDismissTooltip'
  if (document[documentKey] !== true) {
    document[documentKey] = true
    //
    window.addEventListener('touchstart', function (e) {
      for (let i = 0; i < Opentip.tips.length; i++) {
        Opentip.tips[i].hide()
      }
    })
  }
}
//
function New_TooltipSpawningButtonView (tooltipText, context) {
  __injectCSSRules_ifNecessary()

  const buttonTitle = '?'
  const view = commonComponents_tables.New_clickableLinkButtonView(buttonTitle, context)
  const layer = view.layer
  layer.style.marginLeft = '7px'
  layer.style.display = 'inline' // same line
  layer.style.float = 'none'
  layer.style.clear = 'none' // must unset
  const tooltip_options =
	{
	  target: true, // target trigger (`layer`)
	  tipJoint: 'bottom center',
	  containInViewport: true,
	  //
	  stemBase: 14,
	  stemLength: 13,
	  //
	  background: '#FCFBFC',
	  //
	  borderWidth: 0,
	  borderRadius: 5,
	  //
	  shadow: true,
	  shadowBlur: 38,
	  shadowOffset: [0, 19],
	  shadowColor: 'rgba(0,0,0,0.26)'
	}
  tooltip_options.showOn = 'click'
  tooltip_options.hideOn = 'click'
  _once_listenForTouchStartToDismissTooltip()
  const tooltip = new Opentip(layer, tooltip_options)
  tooltip.setContent(tooltipText)
  return view
}
const obj = { New_TooltipSpawningButtonView }
export default obj
