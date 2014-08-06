function getUrlParameter(sParam)
{
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) 
	{
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) 
		{
			return sParameterName[1];
		}
	}
}

var CONN_CLOSED =     101;
var CAPTIONS =        104;
var XDS =             105;
var DOWNLOAD_LINKS =  201;
var PROGRAM_NEW =     103;
var PROGRAM_CHANGED = 106;

var rc;
var cur_links = "";
var links = [];
$(function() {
	var line = 0;
	update();
	rc = setInterval(update, 1000);

	function update() {
		var done = false;
		$.ajax({
		type: "GET",
			url: "cc.php",
			dataType: "json",
			data: {
				id: getUrlParameter('id'),
				st: line
			},
		success: function(data) {
			$.each(data, function(i, d) {
				if (d.command == CAPTIONS) {
					$("<div id=\"cc_line\">" + d.data + "</div>").prependTo("#cc");
				} else if (d.command == XDS && $('#xds_chkbox').prop('checked')) {
					$("<div id=\"cc_line\">" + d.data + "</div>").prependTo("#cc");
				} else if (d.command == CONN_CLOSED) {
					$( "<div id=\"conn_closed_cc\">Connection closed</div>").prependTo("#cc");

					clearInterval(rc);
					$("#ctrl").remove();

					for (var j = 0; j < links.length; j++) {
						var l = "<div id=\"cc_link\">" + links[j][0];
						for (var k = 1; k < links[j].length; k++)
							l += " " + links[j][k];
						l += "</div>"
						$(l).prependTo("#cc");
					}

				} else if (d.command == PROGRAM_NEW || d.command == PROGRAM_CHANGED) {
					$(
						"<div id=\"new_program\">Program name: " + 
						"<span id=\"pr_name_cc\">" + d.data + "</span>" +
						"</div>"
					).prependTo("#cc");

					if (d.command == PROGRAM_CHANGED)
						$( "<div id=\"cc_link\">Download links: " + cur_links + "</div>").prependTo("#cc");

					var end = links.length;
					links[end] = [];
					links[end][0] = d.data;

					cur_links = "";
					$("#pr_name").html(d.data);
				} else if (d.command == DOWNLOAD_LINKS) {
					cur_links += "<a href=\"" + d.filepath + "\">" + d.name + "</a> ";
					$("#pr_links").html(cur_links);

					var last = links.length - 1;
					links[last][links[last].length] = "<a href=\"" + d.filepath + "\">" + d.name + "</a>";
				}

				if (d.command == CAPTIONS || d.command == XDS)
					line = parseInt(d.line) + 1;
			});
		}
		});
	}
});
