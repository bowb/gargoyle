/*
 * Copyright (c) 2014 Truman Lackey lacktrum@gmail.com
 */

function saveChanges()
{
	var enabled = getSelectedValue("webfilter_enabled");
	var httpsWhilteListFilterEnabled = getSelectedValue("webfilter_httpswhitelisturl");
	var loglevel = getSelectedValue("webfilter_loglevel");
	var startServers = 10;
	var tinyproxyPort = 8888;
	var dansguardianPort = 8080;
	var allowips = "all";//document.getElementById("tinyproxy_allowips").value;
//	var allowips_custom = document.getElementById("tinyproxy_allowipsedit").value;
//	var allowips_option = getSelectedValue("tinyproxy_allowips").value;
	var transproxy = 1;
	var filterurl = getSelectedValue("webfilter_filterurl");
	var httpswhitelist = getSelectedValue("webfilter_httpswhitelisturl");
	var filter_file = new Array();
	var filter_file = document.getElementById("webfilter_filterurledit").value.split('\n');
	var whitelist_file = new Array();
	var whitelist_file = document.getElementById("webfilter_httpswhitelisturledit").value.split('\n');
	
	var errors = [];
	
	if (errors.length > 0)
	{
		alert( errors.join("\n") + "\n\nUnable to save settings" );
		return;
	}

	setControlsEnabled(false, true);

	var uci = uciOriginal.clone();

	var preCommands = [];

	preCommands.push("uci set tinyproxy.@tinyproxy[0].Listen=0.0.0.0");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].Port='" + tinyproxyPort + "'");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].LogLevel='" + loglevel + "'");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].Allow='" + allowips + "'");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].StartServers='" + startServers + "'");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].FilterURL='" + filterurl + "'");
	preCommands.push("uci set tinyproxy.@tinyproxy[0].Filter=/etc/tinyproxy/filter");
	//preCommands.push("uci set tinyproxy.@tinyproxy[0].FilterHttpsWhiteListURL='" + httpswhitelist + "'");
	if(httpsWhilteListFilterEnabled == "On")
	{
		preCommands.push("uci set tinyproxy.@tinyproxy[0].FilterHttpsWhiteList=/etc/tinyproxy/httpswhitelistfilter");
	}
	else
	{
		preCommands.push("uci delete tinyproxy.@tinyproxy[0].FilterHttpsWhiteList");
	}

	// add content to file
	createFilterCommands = [ "mkdir /etc/tinyproxy", "touch /etc/tinyproxy/filter","touch /etc/tinyproxy/httpswhitelistfilter" ];
	createFilterCommands.push("echo \"" + filter_file.join('\n') + "\" > /etc/tinyproxy/filter");
	createFilterCommands.push("echo \"" + whitelist_file.join('\n') + "\" > /etc/tinyproxy/httpswhitelistfilter");
	
	var postCommands = [];

	routerIP = uciOriginal.get("network", "lan", "ipaddr");
	var TransparentRule = [ "iptables -t nat -A PREROUTING -i br-lan -p tcp ! -d " + routerIP  + " --dport 80 -j REDIRECT --to-port " + dansguardianPort ];
	var SslRule = [ "iptables -t nat -A PREROUTING -i br-lan -p tcp ! -d " + routerIP  + " --dport 80 -j REDIRECT --to-port " + tinyproxyPort ];
	var SingleIPRule = [ "iptables -t nat -I PREROUTING czes-s " + allowips  + " -p tcp --dport 80 -j REDIRECT --to-port " + tinyproxyPort ];
    var createFirewallRule = [];

	if(transproxy == "1")
	{
		createFirewallRule.push("echo \"" + TransparentRule + "\" > /etc/webfilter.rule");
		createFirewallRule.push("echo \"" + SslRule + "\" >> /etc/webfilter.rule");
		preCommands.push("uci set tinyproxy.@tinyproxy[0].TransparentProxy=1");
	}
	else
	{
		createFirewallRule.push("sed -i 's/"+ TransparentRule +"//g' /etc/webfilter.rule");
		createFirewallRule.push("sed -i 's/"+ SslRule +"//g' /etc/webfilter.rule");
		preCommands.push("uci set tinyproxy.@tinyproxy[0].TransparentProxy=0");
	}

    if(enabled == "1")
    {
		preCommands.push("uci set tinyproxy.@tinyproxy[0].enabled=1");
		postCommands.push("/etc/init.d/tinyproxy enable");
		postCommands.push("/etc/init.d/dansguardian enable");
    }
    if(enabled == "0")
    {
		createFirewallRule.push("sed -i 's/"+ TransparentRule +"//g' /etc/webfilter.rule");
		createFirewallRule.push("sed -i 's/"+ SslRule +"//g' /etc/webfilter.rule");
		preCommands.push("uci set tinyproxy.@tinyproxy[0].enabled=0");
		postCommands.push("/etc/init.d/tinyproxy disable");
		postCommands.push("/etc/init.d/dansguardian disable");
    }


	//create Log File
	var createLogFile = [ "touch /var/log/tinyproxy.log", "chown nobody.nogroup /var/log/tinyproxy.log" ];

	preCommands.push("uci commit");

	postCommands.push("/etc/init.d/tinyproxy restart");
	postCommands.push("/etc/init.d/dansguardian restart");
	postCommands.push("/etc/init.d/firewall restart");

	var commands = createFilterCommands.join("\n") + "\n" + createFirewallRule.join("\n") + "\n" + createLogFile.join("\n") + "\n" + preCommands.join("\n") + "\n" +  uci.getScriptCommands(uciOriginal) + "\n" + postCommands.join("\n") + "\n";
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();
			setControlsEnabled(true);
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}


function setVisibilityWebfilter()
{
	setInvisibleIfIdMatches("webfilter_enabled", "0", "webfilter_container", "block", document);
}

function setVisibilityFilterURL()
{
	setInvisibleIfIdMatches("webfilter_filterurl", ["Off"], "webfilter_filterurledit_container", "block", document);
}

function setVisibilityWhiteListURL()
{
	setInvisibleIfIdMatches("webfilter_httpswhitelisturl", ["Off"], "webfilter_httpswhitelisturledit_container", "block", document);
}
//function setVisibilityAllowIP()
//{
//        setInvisibleIfIdMatches("tinyproxy_allowips", ["all"], "tinyproxy_allowipedit_container", "block", document);
//}

function showLog()
{

if( typeof(viewLogWindow) != "undefined" )
	{
		//opera keeps object around after
		//window is closed, so we need to deal
		//with error condition
		try
		{
			viewLogWindow.close();
		}
		catch(e){}
	}


	try
	{
		xCoor = window.screenX + 225;
		yCoor = window.screenY+ 225;
	}
	catch(e)
	{
		xCoor = window.left + 225;
		yCoor = window.top + 125;
	}

	viewLogWindow = window.open("webfilter_view.sh", "Log", "width=800,height=600,left=" + xCoor + ",top=" + yCoor );

}

function resetData()
{

	//FilterURL disable by default
	setSelectedValue("webfilter_filterurl", "Off", document);
	setSelectedValue("webfilter_httpswhitelisturl", "Off", document);
	//setSelectedValue("webfilter_transparent", "0", document);
	//setSelectedValue("tinyproxy_allowips", "all", document);

	var tpSections = uciOriginal.getAllSectionsOfType("tinyproxy", "tinyproxy");

	var enabled = uciOriginal.get("tinyproxy", tpSections[0], "enabled");
	setSelectedValue("webfilter_enabled", enabled);

	var filterurl = uciOriginal.get("tinyproxy", tpSections[0], "FilterURL");
	setSelectedValue("webfilter_filterurl", filterurl);
	
	var httpsfilterurl = uciOriginal.get("tinyproxy", tpSections[0], "FilterHttpsWhiteList");
	if(!httpsfilterurl || 0 == httpsfilterurl.length) {
		setSelectedValue("webfilter_httpswhitelisturl","Off");
	}
	else {
		setSelectedValue("webfilter_httpswhitelisturl","On");
	}
 
	//var startservers = uciOriginal.get("tinyproxy", tpSections[0], "StartServers");
	//setSelectedValue("webfilter_startservers", startservers);

	//var transproxy = uciOriginal.get("tinyproxy", tpSections[0], "TransparentProxy");
	//setSelectedValue("webfilter_transparent", transproxy);

	//document.getElementById("tinyproxy_port").value = uciOriginal.get("tinyproxy", tpSections[0], "Port");
	document.getElementById("webfilter_loglevel").value = uciOriginal.get("tinyproxy", tpSections[0], "LogLevel");
	//document.getElementById("tinyproxy_allowips").value = uciOriginal.get("tinyproxy", tpSections[0], "Allow");

	document.getElementById("webfilter_filterurledit").value = filterurl_file.join('\n');
	document.getElementById("webfilter_httpswhitelisturledit").value = whitelisturl_file.join('\n');

	setVisibilityWebfilter();
	setVisibilityFilterURL();
	setVisibilityWhiteListURL();
	//setVisibilityAllowIP();
}