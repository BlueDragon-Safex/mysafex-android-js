// Copyright (c) 2014-2019, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"

//
import View from '../../Views/View.web';

//
class ConnectivityMessageBarView extends View
{
	constructor(options, context)
	{
		super(options, context)
		//
		const self = this
		self.setup()
	}
	setup()
	{
		const self = this
		self.setup_views()
		self.startObserving()
		//
		self.configureUI()
	}
	setup_views()
	{
		const self = this
		self.setup_layer()
	}
	setup_layer()
	{
		const self = this
		const layer = self.layer
		layer.style.position = "fixed"
		layer.style.zIndex = 100
		var leftMargin = 16
		
		layer.style.width = `calc(100% - ${leftMargin}px - 16px)`
		layer.style.minHeight = "24px"
		layer.style.padding = "4px 8px"
		layer.style.left = `${leftMargin}px`
		layer.style.top = "44px"
		layer.innerHTML = "No Internet Connection Found"
		//
		layer.style.background = "rgba(49,47,43,1)"
		layer.style.border = "0.5px solid rgba(245,230,125,0.30)"
		layer.style.textShadow = "0 1px 0 rgba(0, 0, 0, 0.6)"
		layer.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,0.40)"
		layer.style.borderRadius = "3px"
		layer.style.boxSizing = "border-box"
		layer.style.color = "#F5E67E"
		layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
		layer.style.fontSize = "11px"
		layer.style.fontWeight = "600" // semibold desired but "semibold" doesn't apparently work
		layer.style.wordBreak = "break-word"
	}
	startObserving()
	{
		const self = this
		window.addEventListener('load', function()
		{
			window.addEventListener('online', function() { self.configureUI() })
			window.addEventListener('offline', function() { self.configureUI() })
		})
	}
	//
	configureUI()
	{
		const self = this
		const isOnLine = navigator.onLine
		if (isOnLine) {
			self.layer.style.display = "none"
		} else {
			self.layer.style.display = "block"
		}
	}
}
export default ConnectivityMessageBarView;