$('.dlcradle-options').change(function() {
    $.get(
        "dlcradle",
        {
            "proxy": $("#need-proxy").is(':checked'),
            "tlsv12": $("#need-tlsv12").is(':checked'),
        }
    ).done(function(data) { $('#dlcradle').text(data); });
});

function toggleDiv(id) {
    var div = document.getElementById(id);
    div.style.display = div.style.display == "none" ? "block" : "none";
}

$('.delete-clipboard').click(function(){
    var id = $(this).attr('data-id');
     $.post("clipboard/delete", {id: id});
     $("#card-" + id).remove();
});

$('#clipboard-delete-all').click(function(){
    $.post({
        url: "clipboard/del-all",
        success: function() { location.reload(); },
    });
});

$('#reloadbutton').click(function(){
    $.post({
        url: "reload",
        success: function() { location.reload(); },
    });
});

$(function() {
    $('[data-toggle="popover"]').popover(
         {
             html: true,
             sanitize: false,
             content: function () {
                 var id = $(this).attr('data-shellid');
                 var result = $('#popover-content-' + id + " table").html();
                 return result;
             }
        }
    );
});

function update_shell_buttons() {
    $("#shell-log-modal").on("show.bs.modal", function(e) {
        var link = $(e.relatedTarget).attr("href");
        $(this).find(".modal-body").load(link);
        $(this).find(".modal-footer a").attr("href", link+"&content=raw");
    });

    $('.kill-shell').click(function(){
        var id = $(this).closest('.card').find('.shell-tooltip').attr('data-shellid');
        $.post({
            url: "kill-shell",
            data: {"shellid": id},
            success: function() { location.reload(); },
        });
    });

    $('.forget-shell').click(function(){
        var id = $(this).closest('.card').find('.shell-tooltip').attr('data-shellid');
        $.post({
            url: "forget-shell",
            data: {"shellid": id},
            success: function() { location.reload(); },
        });
    });

    $('#kill-all').click(function(){
        $.post({
            url: "kill-all",
            success: function() { location.reload(); },
        });
    });
};
update_shell_buttons();

var socket;
$(document).ready(function(){
    // start up the SocketIO connection to the server
    socket = io.connect('//' + document.domain + ':' + location.port + '/push-notifications');
    // this is a callback that triggers when the 'push' event is emitted by the server.
    socket.on('push', function(msg) {
        var toast = $('#toast-container div').eq(0).clone(true).appendTo('#toast-container');
        toast.find('.toast-title').text(msg.title);
        toast.find('.toast-subtitle').text(msg.subtitle);
        toast.find('.toast-body').text(msg.msg);
        $('#toast-container .toast').last().on('hidden.bs.toast', function () {
            // remove the toast from the dom tree after it faded out
            $(this).remove();
        });
        actOnPushMsg(msg);
        if (msg.title != "") {
            $('#toast-container .toast').last().toast('show');
        };
    });
});

function actOnPushMsg(msg) {
    console.log(window.location.pathname);
    if (msg.msg.startsWith("Reverse shell caught")) {
        $("#noshell-note").addClass('d-none');
        $("#shell-list").removeClass('d-none');
        $.get(
            "receiver/shellcard",
            {
                "shell-id": msg.shellid,
            }
        ).done(function(data) {
            $(data).hide().appendTo('#accordion').fadeIn(750);
            update_shell_buttons();
        });
    } else if (msg.msg.startsWith("Update Clipboard")
            && window.location.pathname == "/clipboard") {
            location.reload();
    } else if (msg.msg.startsWith("Update Fileexchange")
            && window.location.pathname == "/fileexchange") {
            location.reload();
    };
};

feather.replace();
