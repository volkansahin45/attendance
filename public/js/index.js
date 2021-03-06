$(function () {
    //Get employees from server
    $.get("./getusers", function (res) {
        fillTable(res);
    });

    //fill table with users
    function fillTable(res) {
        var users = res.payload;
        var usersLength = users.length;

        for (var i = 0; i < usersLength; i++) {
            var userid = users[i].uid;
            var username = users[i].name;
            var selectedList = '<div class="form-group"><select class="form-control" id="selectreason' + userid + '"><option>General</option><option>Vacation</option><option>Doctor</option></select></div>';
            $(".users tbody").append("<tr><td id=" + userid + ">" + userid + "</td><td>" + username + "</td><td>" + selectedList + "</td></tr>");
        }
    }

    //get user last status (1:enter, 0:leaving)
    function getUserLastStatus(userid) {
        var directvalue;
        console.log("user id : " + userid);
        $.ajax({
            type: 'POST',
            url: "./laststatus",
            data: { userid: userid },
            success: function (res) {
                //if employee use system first. It will be 1 namely 'entering'.
                directvalue = res.payload[0].direct;
                console.log("direct : " + directvalue);
            },
            async: false
        });

        console.log("directvalue : " + directvalue)
        return directvalue;
    }

    //send enter or leave status to server
    function sendEnteringLeaving(userid) {
        var lastStatus = getUserLastStatus(userid);
        console.log("laststatus : " + lastStatus);
        var newstatus = lastStatus ? 0 : 1;
        console.log("newstatus : " + newstatus);
        var reason = $("#selectreason" + userid).val();
        var reasonnumber = 0;

        switch (reason) {
            case "General":
                reasonnumber = 1;
                break;
            case "Vacation":
                reasonnumber = 2;
                break;
            case "Doctor":
                reasonnumber = 3;
                break;
        }
        console.log(reasonnumber);

        $.post("./enteringleaving", { userid: userid, direct: newstatus, type: reasonnumber }, function (res) {
            var response = res.code;
            if (response == 200) {
                alert("Succesfully Completed");
            }
            else {
                alert("Error");
            }
        });
    }

    //Table row click event
    $(document).on("click", ".users tbody tr", function () {
        var userid = $(this).find("td:first-child").text();
        sendEnteringLeaving(userid);
    });

    //block click on row when click on reason list
    $(document).on("click", ".users tbody tr .form-group", function (event) {
        event.stopPropagation();
    });

    //see all employeer's work time click event
    $(document).on("click", ".worktime", function (event) {
        var startDate = $("#startDate").val();
        var finishDate = $("#finishDate").val();

        if (startDate && finishDate) {
            $.post("./worktime", { startDate: startDate, finishDate : finishDate }, function (res) {
                console.log(res);
                fillModal(res.payload);
            });
        }
        
        else {
            $(".workingtimestable").html("").html("<h4>Please select start and finish date</h4>");
        }

    });

    //Fill Modal with user id and working times
    function fillModal(workingtimes) {
        var modaltablebody = $(".workingtimestable").html('<div class="table-responsive"><table class="table table-striped table-hover timetable"><thead><tr><th>User ID</th><th>Name Surname</th><th>Date</th><th>Working Time(DD:HH:MM:SS)</th></tr></thead><tbody></tbody></table></div>');
        var content = $(".timetable tbody").html("");
        workingtimes.forEach(function (element) {
            var id = element.fk_user;
            var namesurname = element.name;
            var date = element.date;
            var time = sformat(element.workingtime);
            $(".timetable tbody").append("<tr><td>" + id + "</td><td>" + namesurname + "</td><td>" + date + "</td><td>" + time + "</td></tr>");
        }, this);
    }

    //Convert Second to Time (Taken from web)
    function sformat(seconds) {
        var numdays = ("0" + Math.floor(seconds / 86400)).slice(-2);
        var numhours = ("0" + Math.floor((seconds % 86400) / 3600)).slice(-2);
        var numminutes = ("0" + Math.floor(((seconds % 86400) % 3600) / 60)).slice(-2);
        var numseconds = ("0" + ((seconds % 86400) % 3600) % 60).slice(-2);
        return numdays + ":" + numhours + ":" + numminutes + ":" + numseconds;
    }
})

