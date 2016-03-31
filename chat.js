//call on page load
var conn = new Strophe.Connection("ws://10.10.1.200:7070/ws/server");
conn.connect("asdfgh", "asdf", onConnect);

//callback onconnect
function onConnect(status) {
    if (status == Strophe.Status.CONNECTING) {
        console.log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        console.log('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        console.log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        console.log('Strophe is disconnected.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
        // console.log('Strophe is connected.');

        conn.send($pres());
        //console.log("onmessage called1");
        conn.muc.join("testroom@conference.10.10.1.200", conn.authzid, onMessage, null, null, null, null);
    }
}
//handling other user status



function onMessage(msg) {
    console.log("onmessage called");
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    var rx = new RegExp(/is typing.$/);
    var elem = $("#isTyping");

    if (type == "groupchat" && msg.getElementsByTagName('paused').length > 0 && elems.length <= 0) {
        // console.log("from : "+from);
        // console.log("to : "+to);
        // console.log("captured pause :: "+to+" :: "+from);
        if (!(conn.authzid === from.split(/\//)[1])) {
            // console.log("removing user");
            //var elem = $("#isTyping");
            //start with no entries
           // var alias = "^" + from.split(/\//)[1] + " ";
            var dyn = new RegExp("^" + from.split(/\//)[1] + " ");
            // // console.log("dyn:" + dyn);
            // somewhere in between
            // var rep = ", " + from.split(/\//)[1] + ",";
            // var repp = new RegExp(rep);
            // console.log("rep:" + repp);
           // var last = ", " + from.split(/\//)[1] + " ";
            var lastt = new RegExp(", " + from.split(/\//)[1] + " ");
            // console.log("lastt:" + lastt);
            //start with entires
           // var start = "^" + from.split(/\//)[1] + ", ";
            var startt = new RegExp("^" + from.split(/\//)[1] + ", ");
            // console.log("startt:" + startt);
            elem.text(elem.text().replace(new RegExp(", " + from.split(/\//)[1] + ","), ","));
            // //break;
            // console.log(elem.text());
            if (lastt.test(elem.text())) {
                console.log("last");
                elem.text(elem.text().replace(lastt, " "));
            }
            if (dyn.test(elem.text())) {
                console.log("aheadalone");
                elem.text(elem.text().replace(dyn, ""));
            }
            if (startt.test(elem.text())) {
                console.log("ahead");
                elem.text(elem.text().replace(startt, ""));
            }

            // elem.text(elem.text().replace(rep,""));
            if (elem.text().search(/is typing./) == 0) {
                elem.text("");
            }
        }
    }
    if (type == "groupchat" && msg.getElementsByTagName('composing').length > 0 && elems.length <= 0) {
        // console.log("from : "+from);
        // console.log("to : "+to);
        // console.log(conn.jid);
        var regex = new RegExp();
        //console.log("captured composing :: "+to+" :: "+from);
        if (!(conn.authzid === from.split(/\//)[1])) {
            // console.log("reached");

            //people already der
            if (rx.test(elem.text())) {
                //  console.log("already exists");
                elem.text(from.split(/\//)[1] + ", " + elem.text());
            } else
            //only one person
                elem.text(from.split(/\//)[1] + " is typing.");
        }
    }

    if (type == "groupchat" && elems.length > 0) {
        var body = elems[0];

        //  console.log('ECHOBOT: I got a message from ' + from + ': ' +
        //      Strophe.getText(body));

        var elem = document.getElementById("message_box");
        elem.innerHTML += "</br>" + from + "::" + Strophe.getText(body);
    }

    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
    return true;
}

//send message
function mysend() {
    var text = document.getElementById("message").value;
    var from = conn.jid;
    var to = "test@10.10.1.200";
    conn.muc.message("testroom@conference.10.10.1.200", null, text, null, "groupchat");

}

var jidParser = function(jid) {
    var res = jid.split(/@|\//);
    console.log(res);
    return {
        "name": res[0],
        "domain": res[1],
        "resource": res[2]
    }
}
var resetPausedTimer = (function() {
    var wait = 5000;
    var t;
    var sentActive = false;
    var alert = function() {
        clearTimeout(t);
        conn.chatstates.sendPaused("testroom@conference.10.10.1.200", "groupchat");
        sentActive = false;
    }
    return function() {
        clearTimeout(t);
        t = setTimeout(alert, wait);
        if (!sentActive) {
            conn.chatstates.sendComposing("testroom@conference.10.10.1.200", "groupchat");
            sentActive = true;
        }
    }

})();