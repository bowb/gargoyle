#!/usr/bin/haserl
<?
	# Copyright (c)  2010-2011 Artur Wronowski <arteqw@gmail.com> 
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "connection" -p "webfilter" -c "internal.css" -j "webfilter.js" tinyproxy network
?>

<script>
<!--
<?

   echo "var filterurl_file = new Array();"
   echo "var whitelisturl_file = new Array();"
   if [ -e /etc/tinyproxy/filter ]; then 
      cat /etc/tinyproxy/filter | awk '{print "filterurl_file.push([\""$1"\"]);"};'
   fi
   
    if [ -e /etc/tinyproxy/httpswhitelistfilter ]; then 
      cat /etc/tinyproxy/httpswhitelistfilter | awk '{print "whitelisturl_file.push([\""$1"\"]);"};'
   fi

?>
//-->
</script>

<fieldset id="webfilter">
	<legend class="sectionheader">Webfilter</legend>
		<div id='webfilter_enabled_container' class='rightcolumn'>
		<label id='webfilter_enabled_label' class='leftcolumn'>Webfilter</label>
			<select class="rightcolumn" id="webfilter_enabled" onchange="setVisibilityWebfilter()">
				<option value="1">Enabled</option>
				<option value="0">Disabled</option>
			</select>
		</div>

	 <div id="webfilter_container">
		<div id='webfilter_httpswhitelisturl_container'>
		   <label id="webfilter_httpswhitelisturl_label" class="leftcolumn" for="webfilter_httpswhitelisturl">Https whitelist:</label>
		      <select class="rightcolumn" id="webfilter_httpswhitelisturl" onchange="setVisibilityWhiteListURL()">
                                <option value="On">Enabled</option>
                                <option value="Off">Disabled</option>
              </select>
		</div>
		
		<div id='webfilter_httpswhitelisturledit_container'>
                        <label id="webfilter_httpswhitelisturledit_label" class="leftcolumn" for="webfilter_httpwhitelisturledit">Https whitelist URLs:</label>
                        <textarea id="webfilter_httpswhitelisturledit" class="nocolumn" rows='4' cols='30'/></textarea>
        </div>
		<div style="clear:both;">
        <div id='webfilter_filterurl_container' class='rightcolumn'>
            <label id='webfilter_filterurl_label' class='leftcolumn'>Blacklist:</label>
               <select class="rightcolumn" id="webfilter_filterurl" onchange="setVisibilityFilterURL()">
                                <option value="On">Enabled</option>
                                <option value="Off">Disabled</option>
               </select>
        </div>
		
		<div id='webfilter_filterurledit_container'>
                        <label id="webfilter_filterurledit_label" class="leftcolumn" for="webfilter_filterurledit">Filter URLs:</label>
                        <textarea id="webfilter_filterurledit" class="nocolumn" rows='4' cols='30'/></textarea>
        </div>

		<div id='webfilter_loglevel_container'>
                        <label id="webfilter_loglevel_label" class="leftcolumn" for="webfilter_port">Log level:</label>
                        <select class="rightcolumn" id="webfilter_loglevel">
                                <option value="Critical">Critical</option>
                                <option value="Error">Error</option>
				<option value="Warning">Warning</option>
				<option value="Notice">Notice</option>
				<option value="Connect">Connect</option>
				<option value="Info">Info</option>
                </select>
		</div>

		<div class='rightcolum' style="margin-bottom:15px">
			<input type='button' id="webfilter_logview_button" value="Show proxy log" class="default_button" onclick="showLog()" />
		</div>
	</div>

</fieldset>

<div id="bottom_button_container">
	<input type='button' value='Save Changes' id="save_button" class="bottom_button" onclick='saveChanges()' />
	<input type='button' value='Reset' id="reset_button" class="bottom_button" onclick='resetData()'/>
</div>



<!-- <br /><textarea style="margin-left:20px;" rows=30 cols=60 id='output'></textarea> -->

<script>
<!--
	resetData();
//-->
</script>


<?
	gargoyle_header_footer -f -s "connection" -p "webfilter"
?>
