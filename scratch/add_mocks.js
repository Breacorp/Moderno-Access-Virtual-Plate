const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const mocks = {
    "'if.cgi\\\\$Userlogdata': ''": "'if.cgi\\\\$Userlogdata': '<TR align=\"center\"><TD>1</TD><TD>1001</TD><TD>Admin</TD><TD>2026/05/05</TD><TD>12:00</TD><TD>IN</TD><TD>1</TD><TD>Access</TD></TR>'",
    "'man.cgi\\\\$event_hold': ''": "'man.cgi\\\\$event_hold': '10,10,10,10,10'",
    "'man.cgi\\\\$event_list_g1': ''": "'man.cgi\\\\$event_list_g1': '1,0,1,0,1,0,1,0,1,0,1,0,1,0'",
    "'man.cgi\\\\$event_list_g2': ''": "'man.cgi\\\\$event_list_g2': '0,1,0,1,0,1,0,1,0,1,0,1,0,1'",
    "'man.cgi\\\\$event_list_g3': ''": "'man.cgi\\\\$event_list_g3': '0,0,0,0,0,0,0,0,0,0,0,0,0,0'",
    "'man.cgi\\\\$ipc_list': ''": "'man.cgi\\\\$ipc_list': '0,0,0,0,0,0,0,0,0,0,0,0,0,0'",
    "'man.cgi\\\\$alarm_list': ''": "'man.cgi\\\\$alarm_list': '0,0,0,0,0,0,0,0,0,0,0,0,0,0'",
    "'man.cgi\\\\$user_group': ''": "'man.cgi\\\\$user_group': '\"Group 1\", \"Group 2\", \"Group 3\", \"Group 4\"'",
    "'man.cgi\\\\$timezone_list': ''": "'man.cgi\\\\$timezone_list': '<option value=\"1\">Timezone 1</option><option value=\"2\">Timezone 2</option>'",
    "'man.cgi\\\\$group_list': ''": "'man.cgi\\\\$group_list': '<option value=\"1\">Group 1</option><option value=\"2\">Group 2</option>'",
    "'if.cgi\\\\$Event_List': ''": "'if.cgi\\\\$Event_List': '<TR align=\"center\"><TD>1</TD><TD>Event 1</TD><TD>2026/05/05</TD></TR>'",
    "'man.cgi\\\\$door_table': ''": "'man.cgi\\\\$door_table': '<TR align=\"center\"><TD>1</TD><TD>Main Door</TD><TD>Online</TD></TR>'"
};

for (const [key, value] of Object.entries(mocks)) {
    const regex = new RegExp(key, 'g');
    serverCode = serverCode.replace(regex, value);
}

fs.writeFileSync('server.js', serverCode);
console.log('Mocks applied to server.js');
