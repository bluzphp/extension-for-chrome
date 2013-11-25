    function get(id){
        return document.getElementById(id);
    }

    function save_options() {
        localStorage["cookie_debug"] = get("cookie_debug").value;
        localStorage["cookie_profile"] = get("cookie_profile").value;
        localStorage["headers_details"] = get("headers_details").value;

        // Update status to let user know options were saved.
        var status = get("status");
        status.innerHTML = "Options Saved.";
        setTimeout(function() {
            status.innerHTML = "";
        }, 750);
    }

    // Restores select box state to saved value from localStorage.
    function restore_options() {
        get("cookie_debug").setAttribute('value', localStorage["cookie_debug"]);
        get("cookie_profile").setAttribute('value', localStorage["cookie_profile"]);
        get("headers_details").setAttribute('value', localStorage["headers_details"]);
    }

    function reset_options() {
        localStorage["cookie_debug"] = 'BLUZ_DEBUG';
        localStorage["cookie_profile"] = 'XDEBUG_PROFILE';
        localStorage["headers_details"] = 'Bluz-Bar, Bluz-Notify';

        restore_options();
    }

    document.addEventListener('DOMContentLoaded', restore_options);
    document.querySelector('#btn-save').addEventListener('click', save_options);
    document.querySelector('#btn-reset').addEventListener('click', reset_options);
