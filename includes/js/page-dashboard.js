$(function() {
	updateTimeInterval = setInterval(updateTime, 1000);
	updateInfoInterval = setInterval(updateSystemInfo, 5000);
	
	// Timeout Functions
	timoutMinutes = 10;

	setTimeout(() => { 
		clearInterval(updateTimeInterval); 
		clearInterval(updateInfoInterval); 
	}, timoutMinutes * 60000); // Timeout after number of minutes X millisections per minute;

	setTimeout(() => { 
		alert('You\'ve been on this page too long. To reduce demand on the system, auto updating of information has stopped. To start auto updating again, please reload this page.'); 
	}, timoutMinutes * 60000 + 10000); // Timeout after number of minutes X millisections per minute + delay for alert;
  
});



function updateTime(){
	startTime.setSeconds(startTime.getSeconds() + 1);
	$("#cur_date").html($.datepicker.formatDate('dd M yy', startTime));
	$("#cur_time").html( formatTime(startTime) );
}

function formatTime(unixTimestamp){
    var dt = new Date(unixTimestamp * 1);

    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var seconds = dt.getSeconds();

    // prepend the zero here when needed
    if (hours < 10) 
     hours = '0' + hours;

    if (minutes < 10) 
     minutes = '0' + minutes;

    if (seconds < 10) 
     seconds = '0' + seconds;

    return hours + ":" + minutes + ":" + seconds;
}




function updateSystemInfo(){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    var systemInfo = JSON.parse(this.responseText);
	
	 		// System info to update
 	 		$("#cpu_speed").html(systemInfo.cpu_speed);

	 		$("#cpu_load").html(systemInfo.cpu_load);
	 		$("#bar5").width( systemInfo.cpu_load );

	 		$("#cpuTempBoth").html(systemInfo.cpuTempBoth);
	 		$("#uptime").html(systemInfo.uptime);


	 		// Memory Usage
	 		$("#used_mem").html(systemInfo.used_mem);
	 		$("#percent_used").html(systemInfo.percent_used);
	 		$("#bar1").width( systemInfo.percent_used+'%' );

	 		$("#free_mem").html(systemInfo.free_mem);
	 		$("#percent_free").html(systemInfo.percent_free);
	 		$("#bar2").width( systemInfo.percent_free+'%' );

	 		$("#buffer_mem").html(systemInfo.buffer_mem);
	 		$("#percent_buff").html(systemInfo.percent_buff);
	 		$("#bar3").width( systemInfo.percent_buff+'%' );

	 		$("#cache_mem").html(systemInfo.cache_mem);
	 		$("#percent_cach").html(systemInfo.percent_cach);
	 		$("#bar4").width( systemInfo.percent_cach+'%' );
		}
	};
	xmlhttp.open("GET", "../../functions/ajax_system.php?update=info", true);
	xmlhttp.send();
}





// AJAX FUNCTIONS
var ajax_url = 'functions/ajax_system.php'; //Used by all ajax request in this script

function reboot_orp_system() {
    $.ajax({ type: 'POST', dataType: 'text', url: ajax_url, data: { post_service: 'system', post_option: 'restart' } });	   
	clearInterval(updateTimeInterval); 
	clearInterval(updateInfoInterval); 
	reboot_countdown();
}

function reboot_countdown() {
	$("#overlay").show();
	$("#overlay .msg_1").html("Rebooting");

	$("#overlay .msg_2").html("60");

	var doCountdown = function() {
		$('#overlay .msg_2').each(function() {
			var count = parseInt($(this).html());
			if (count !== 1) {
				$(this).html(count - 1);
			} else {
				$("#overlay .msg_1").html("Please Wait...<br>Reloading Page");
				$("#overlay .msg_2").hide();
				window.location.reload(true);
				clearInterval(countDownInterval);
			}
		});
	};
	countDownInterval = setInterval(doCountdown, 1000);
}



function shutdown_orp_system() {
    $.ajax({ type: 'POST', dataType: 'text', url: ajax_url, data: { post_service: 'system', post_option: 'stop' } });	   
	clearInterval(updateTimeInterval); 
	clearInterval(updateInfoInterval); 
	shutdown_countdown();
}

function shutdown_countdown() {
	$("#overlay").show();
	$("#overlay .msg_1").html("Shutdown");

	$("#overlay .msg_2").html("30");

	var doCountdown = function() {
		$('#overlay .msg_2').each(function() {
			var count = parseInt($(this).html());
			if (count !== 1) {
				$(this).html(count - 1);
			} else {
				$("#overlay .msg_1").html("<strong>System Shutdown</strong><br><em>It is now safe to power down the controller</em>");
				$("#overlay .msg_2").hide();
				clearInterval(countDownInterval);
			}
		});
	};
	countDownInterval = setInterval(doCountdown, 1000);
}



function toggleRepeaterState() {
	svxlink_toggle_check_status('svxlink','status');
}


function svxlink_toggle_check_status(service, option) {
    $.ajax({ async: true, type: 'POST', dataType: 'text', url: ajax_url,
        data: { post_service: service, post_option: option },
        success: function (status) {
			var status = $.trim(status);
			if(status==="active") {
				// Shut it down
				svxlink_toggle_state('svxlink','stop');
			} else {
				// Start it ups
				svxlink_toggle_state('svxlink','start');
			}	
        }
    });	   
};


function svxlink_toggle_state(service, option) {
    $.ajax({ async: true, type: 'POST', dataType: 'text', url: ajax_url,
        data: { post_service: service, post_option: option },
        success: function (state) {
			var state = $.trim(state);
			if(state==="active") {
				$( "#rptControlBtn" ).html( '<i class="icon-stop"></i> Stop Repeater' );
				$( "#rptStatus" ).html( '<span class="label label-success">Active</span>' );
			} else if(state==="failed") {
				$( "#rptControlBtn" ).html( '<i class="icon-play"></i> Start Repeater' );
				$( "#rptStatus" ).html( '<span class="label label-warning">FAILED</span> - <a href="log.php">View Log</a>' );
			} else {
				$( "#rptControlBtn" ).html( '<i class="icon-play"></i> Start Repeater' );
				$( "#rptStatus" ).html( '<span class="label label">Deactivated</span>' );
			}	
        }
    });	   
};