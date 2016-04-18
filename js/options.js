/**
 * Alias for document.getElementById
 * @param id
 * @returns {Element}
 */
function get(id){
    return document.getElementById(id);
}

/**
 * Save options to local chrome storage
 */
function save_options() {
    chrome.storage.sync.set({
        cookie_debug: get('cookie_debug').value,
        cookie_profile: get('cookie_profile').value,
        headers_bar: get('headers_bar').value,
        headers_details: get('headers_details').value
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('save');
        status.textContent = 'Options saved...';
        setTimeout(function() {
            status.textContent = 'Save';
        }, 750);
    });
}

/**
 * Restore options from locale chrome storage
 */
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        cookie_debug: 'BLUZ_DEBUG',
        cookie_profile: 'XDEBUG_PROFILE',
        headers_bar: 'Bluz-Bar, Bluz-Notify',
        headers_details: 'Bluz-Debug'
    }, function(items) {
        document.getElementById('cookie_debug').value = items.cookie_debug;
        document.getElementById('cookie_profile').value = items.cookie_profile;
        document.getElementById('headers_bar').value = items.headers_bar;
        document.getElementById('headers_details').value = items.headers_details;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
