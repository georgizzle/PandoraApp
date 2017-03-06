var $ = global.jQuery = require('jquery');
global.Tether = require('tether');
require('bootstrap/dist/js/bootstrap.min');
var hasher = require('hasher')
var crossroads = require('crossroads')
var tinymce = require('tinymce')
require('tinymce/themes/modern/theme.min')

require.context(
  'file-loader?name=[path][name].[ext]&context=node_modules/tinymce!tinymce/skins',
  true,
  /.*/
);

// Plugins
require('tinymce/plugins/paste/plugin')
require('tinymce/plugins/link/plugin')
require('tinymce/plugins/autoresize/plugin')
require('tinymce/plugins/image/plugin')


var TIMEOUT = 30000;
var SITE_URL = "http://localhost:8000/cosmos";
var DEFAULT_PIC = "pictures/Erevos_world_map.png";
var MODERATOR_GROUP = "Moderators"
var current_user = null;


$(document).ready(function(){

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function getCurrentUser() {
        $.ajax({
            url: 'api/currentuser',
            type: 'GET'
        }).fail(function(response) {
            console.log('Couldn\'t obtain current user\'s info');
            return null;
        })
          .done(function(user) {
                current_user = user;
                $('#login-show').remove();
                $('#navbarColor01').append('<a class="dropdown-toggle navbar-brand" data-toggle="dropdown" href="#">' + current_user.username +'</a>\
                        <ul class="dropdown-menu dropdown-menu-right">\
                        <li><a class="nav-link" id ="signout_link" href="#/account/signout">Sign out</a></li>\
                        <li><a class="nav-link" id ="change_pass_link" href="#">Change Password</a></li>\
                        </ul>');
            })   
    };
    

    $('body').on('click', '#login-show', function() {
        $('#LoginModal').modal('show');
    });

    $('body').on('click', '#reg-show', function() {
        $('#LoginModal').modal('hide');
        $('#RegModal').modal('show');
    });

    $('body').on('click', '#change_pass_link', function(e) {
        e.preventDefault();
        $('#ChangePassModal').modal('show');
    });

    $('body').on('click', '#reset_pass_link', function(e) {
        e.preventDefault();
        $('#LoginModal').modal('hide');
        $('#ResetPassModal').modal('show');
    });

    $('body').on('click', 'img', function() {
        $('.enlargeImageModalSource').attr('src', $(this).attr('src'));
        $('#enlargeImageModal').modal('show');
    });

    $('body').on('click', '#login_btn', function() {
        $('.alert').remove();
        doLogin();
    });

    $('body').on('click', '#reg_btn', function() {
        $('.alert').remove();
        doRegister();
    });

    $('body').on('click', '#change_pass_btn', function() {
        $('.alert').remove();
        doChangePassword();
    });

    $('body').on('click', '#reset_pass_btn', function() {
        $('.alert').remove();
        goResetPassword();
    });

    $('body').on('click', '#verify_email_btn', function() {
        $('.alert').remove();
        doVerifyEmail();
    });

    $('body').on('click', '#do_res_pass_btn', function() {
        $('.alert').remove();
        doResetPassword();
    });

    var categories = {"kingdoms" : {
                                     "fields" : [ "name", "description", "history", {"geography":["id", "type", "description"]}, "other_info"]
                                   },
                      "major-events" : {
                                     "fields" : [ "name", "description", "history", "type", {"kingdom":["id", "name", "description"]}]
                                   },
                      "locations" : {
                                     "fields" : [ "description", "type", "latitude", "longitude", "altitude"]
                                   }
    }


    crossroads.addRoute("home",function(){
        goHome();
    });

    crossroads.addRoute("account/signout",function(){
        signOut();
    });

    crossroads.addRoute("account/register",function(){
        goRegistration();
    });

    crossroads.addRoute("{category}",function(category){
        goCategory(category);
    });

    crossroads.addRoute("{category}/add",function(category){
        goAddDetail(category);
    });

    crossroads.addRoute("{category}/{id}",function(category, id){
        goDetail(category, id);
    });

     crossroads.addRoute("{category}/{id}/edit",function(category, id){
        goEditDetail(category, id);
    });


    //handle hash changes
    function parseHash(newHash, oldHash){
        crossroads.parse(newHash);
    }

    function onHasherInit(curHash){
        if (curHash == '') {
            // redirect to "home" hash without keeping the empty hash on the history
            hasher.replaceHash('home');
        } else {
            crossroads.parse(curHash);
       }
    }

    hasher.initialized.add(onHasherInit);
    hasher.initialized.add(parseHash); // parse initial hash
    hasher.changed.add(parseHash); //parse hash changes
    hasher.init(); //start listening for history change

    function goHome() {
        $('#message').empty();
        clearTimeouts()
        if (current_user == null) {
            getCurrentUser()
        }
        $.ajax( 'api/categories' )
            .done(function(data) {
            $('#main-content').empty();
            if (data.length == 0) {
             $('#main-content').append('<p>The are no data (Yet)</p>');
            } else {
                data.forEach(function(item) {
                            var name_attr = item.name.replace(" ", "-").toLowerCase();
                            $('#main-content').append('\
                                <div class="card" style="width: 20rem;">\
                                  <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.img) + '" alt="Card image cap">\
                                  <div class="card-block">\
                                    <h4 class="card-title">' + item.name + '</h4>\
                                    <p class="card-text">' + item.description + '</p>\
                                  </div>\
                                    <a href="#/'+ name_attr +'" class ="view-category" id= "'+ name_attr + '">\
                                        <div class="card-footer">\
                                          <small class="text-muted">See ' + item.name + '</small>\
                                        </div>\
                                    </a>\
                                </div>');
                        })
                    }
            });
    };


    function goCategory(category) {
                    $('#message').empty();
                    clearTimeouts()
                    var category_url = category.replace("-", "");
                    $.ajax('api/' + category_url)
                    .done(function(data) {
                    $('#main-content').empty();
                    if (data.length != 0) {
                        data.forEach(function(item) {
                                    if (item.final) {
                                        $('#main-content').append('\
                                            <div class="card" style="width: 20rem;">\
                                              <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.img) + '" alt="Card image cap">\
                                              <div class="card-block">\
                                                <h4 class="card-title">' + item.name + '</h4>\
                                                <p class="card-text">' + item.description + '</p>\
                                              </div>\
                                                <a href="#/'+ category +'/'+ item.id +'" class="item-detail" id= "' + category + '_' + item.id +'">\
                                                    <div class="card-footer">\
                                                      <small class="text-muted">See ' + item.name + ' details</small>\
                                                    </div>\
                                                </a>\
                                            </div>');
                                    }
                        })

                    }

                    var canAdd = null;

                    if (current_user != null) {
                        current_user.groups.forEach(function(item){ 
                            if (item.name == MODERATOR_GROUP) { 
                                canAdd = true; 
                            }
                        });
                    }
                    
                    if (canAdd){
                        $('#main-content').append('<div class="card" style="width: 20rem;">\
                                <div class="card-block">\
                                    <a href="#/'+ category +'/add" id= "' + category + '_add">\
                                        <h4 class="card-title">Add new '+ to_singular(category) +'</h4>\
                                    </a>\
                                </div>\
                                <div class="card-footer">\
                                    <small class="text-muted">Viewable only by Moderators</small>\
                                </div>\
                        </div>')
                    }
                    setTimeout(function() {goCategory(category)}, TIMEOUT);
                   })
    }


    function goDetail(category, id) {
            $('#message').empty();
            clearTimeouts()
            var category_url = category.replace("-", "");
            $.ajax( 'api/' + category_url + '/' + id )
            .done(function(item) {
                $('#main-content').empty();
                if (item.length == 0) {
                        $('#main-content').append('<p>Oops! There was an error!</p>');
                } else {
                        if (item.final) {
                            $('#main-content').append('\
                                <div class="card" style="width: 20rem;">\
                                  <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.img) + '" alt="Card image cap">\
                            </div>');

                            categories[category]["fields"].forEach(function(field) {
                                field_name = typeof field === 'object' ? Object.keys(field)[0] : field
                                $('#main-content > .card').append('\
                                    <div class="card-block" id="' + category + '-' + field_name + '-' + id + '">\
                                    </div>');
                                if (typeof field !== 'object' && item[field] !== null) {
                                    $('#' + category + '-' + field_name + '-' + id).append('\
                                    <h4 class="card-title">' + field_name.replace("_", " ") + '</h4>\
                                    <p class="card-text">' + item[field] + '</p>')
                                } else if (typeof field === 'object' && item[field_name] !== null) {
                                    $('#' + category + '-' + field_name + '-' + id).append('\
                                        <h4 class="card-title">' + field_name.replace("_", " ") + '</h4>')
                                        field[field_name].forEach(function(subfield) {
                                            $('#' + category + '-' + field_name + '-' + id).append('\
                                                <h6 class="card-subtitle text-muted">' + subfield.replace("_", " ") + '</h6>\
                                                <p class="card-text">' + item[field_name][subfield] + '</p>'
                                            )

                                        });
                                }
                            });

                            var canEdit = null;

                            if (current_user != null) {
                                current_user.groups.forEach(function(item){ 
                                    if (item.name == MODERATOR_GROUP) { 
                                        canEdit = true; 
                                    }
                                });
                            }
                                    
                            if (canEdit) {
                                $('#main-content > .card').append('\
                                        <a href="#/'+ category +'/'+ item.id +'/edit" class="item-detail_edit" id= "' + category + '_' + item.id +'_edit">\
                                            <div class="card-footer">\
                                              <small class="text-muted">Edit ' + item.name + '</small>\
                                            </div>\
                                        </a>\
                                 ')
                             }
                        } else {
                            $('#main-content').append('<p>This item is not finalized yet</p>');
                        }
                }
            setTimeout(function() {goDetail(category, id)}, TIMEOUT);
            });
    };


    function goAddDetail(category) {
        $('#message').empty();
        clearTimeouts()
        var category_url = category.replace("-", "");
        $.ajax({ url : 'api/' + category_url ,
                  method: 'OPTIONS'
            })
            .done(function(data) {

                $('#main-content').empty();

                if (data.hasOwnProperty('actions')) {

                    var attributes = data.actions.POST

                    $('#main-content').append('\
                            <div class="card" style="width: 20em;">\
                            </div>');

                    $('#main-content > .card').append('<form id="' + category + '_add_form" enctype="multipart/form-data">\
                                                            <fieldset></fieldset>\
                                                            <button type="button"\
                                                            id="add_detail_btn"\
                                                            class="btn btn-primary btn-block"\
                                                            >Add ' + to_singular(category) +'</button>\
                                                            <form>')

                    Object.keys(attributes).forEach(function(key,index) {

                        if (true ) {

                            if (attributes[key]['type'] == 'string' && attributes[key].hasOwnProperty('max_length')) {
                                $('#' + category + '_add_form > fieldset').append(
                                '<div class="form-group">\
                                <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                <input type="text" class="form-control" name= "'+ key +'" id="'+ key +'" maxlength="'+ attributes[key]['max_length'] +'">\
                                </div>'
                                )
                            } else if (attributes[key]['type'] == 'string') {
                                $('#' + category + '_add_form > fieldset').append(
                                    '<div class="form-group">\
                                        <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                        <textarea class="form-control textarea-field" name= "'+ key +'"  id="'+ key +'"></textarea>\
                                    </div>'
                                )

                            } else if (attributes[key]['type'] == 'image upload') {
                                $('#' + category + '_add_form > fieldset').append(
                                    '<div class="form-group">\
                                        <label for="'+ key +'">Upload Image</label>\
                                        <input type="file" class="form-control-file"  name= "'+ key +'" id="'+ key +'" aria-describedby="fileHelp">\
                                        <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ category.replace("-", " ") +'\' cards</small>\
                                    </div>'
                                )
                            }
                        }

                    });
                        tinymce.remove();
                        tinymce.init({
                            selector: ".textarea-field",
                            theme: "modern",
                            plugins: ['paste', 'link', 'autoresize', 'image'],
                            image_list: [
                                {title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
                                {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
                            ]
                        })

                        $('body').off().on('click', '#add_detail_btn' , function(e) { e.preventDefault(); doAddDetail(category)})

                } else {
                    $('#message').append('\
                        <div class="alert alert-dismissible alert-danger">\
                            <button type="button" class="close" data-dismiss="alert">×</button>\
                            You are not authorized to view this page\
                        </div>')
                    }
            });
            
        };


    function goEditDetail(category, id) {
        $('#message').empty();
        clearTimeouts();
        var category_url = category.replace("-", "");
        $.ajax({ url : 'api/' + category_url + '/' + id,
                  method: 'OPTIONS'
            })
            .done(function(data) {

                $('#main-content').empty();

                if (data.hasOwnProperty('actions')) {

                    var attributes = data.actions.PUT

                    $('#main-content').append('\
                            <div class="card" style="width: 20em;">\
                            </div>');

                    $('#main-content > .card').append('<form id="' + category + '_edit_form" enctype="multipart/form-data">\
                                                        <fieldset></fieldset>\
                                                        <button type="button"\
                                                        id="edit_detail_btn"\
                                                        class="btn btn-primary btn-block"\
                                                        >Edit ' + to_singular(category) +'</button>\
                                                        <form>')

                    Object.keys(attributes).forEach(function(key,index) {

                        if (attributes[key]['required'] == true ) {

                            if (attributes[key]['type'] == 'string' && attributes[key].hasOwnProperty('max_length')) {
                                $('#' + category + '_edit_form > fieldset').append(
                                '<div class="form-group">\
                                <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                <input type="text" class="form-control"  name= "'+ key +'" id="'+ key +'" maxlength="'+ attributes[key]['max_length'] +'">\
                                </div>'
                                )
                            } else if (attributes[key]['type'] == 'string') {
                                $('#' + category + '_edit_form > fieldset').append(
                                    '<div class="form-group">\
                                        <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                        <textarea class="form-control  textarea-field" name= "'+ key +'"  id="'+ key +'"></textarea>\
                                    </div>'
                                )

                            } else if (attributes[key]['type'] == 'image upload') {
                                $('#' + category + '_edit_form > fieldset').append(
                                    '<div class="form-group">\
                                        <label for="'+ key +'">Upload Image</label>\
                                        <input type="file" class="form-control-file"  name= "'+ key +'" id="'+ key +'" aria-describedby="fileHelp">\
                                        <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ to_singular(category) +'\' summary</small>\
                                    </div>'
                                )
                            }
                        }
                    });

                    tinymce.remove();
                            tinymce.init({
                            selector: ".textarea-field",
                            theme: "modern",
                            plugins: ['paste', 'link', 'autoresize', 'image'],
                            image_list: [
                                {title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
                                {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
                            ]
                        })

                    var original_item = {};
                    //get details to prepopulate form elements
                    $.ajax( 'api/' + category_url + '/' + id )
                                .done(function(item) {
                                    original_item = item
                                    Object.keys(item).forEach(function(key,index) {
                                        if($("#" + key).length != 0) {
                                            if ($("#" + key).is("textarea")) {
                                                tinymce.get(key).setContent(item[key]);
                                            } else if ($("#" + key).is('input:text')) {
                                                $("#" + key).val(item[key])
                                            }
                                        }
                                    });
                        });



                    $('body').off().on('click', '#edit_detail_btn' , function(e) { 
                        e.preventDefault();
                        doEditDetail(category, id, original_item);
                    })

                } else {
                    $('#message').append('\
                        <div class="alert alert-dismissible alert-danger">\
                            <button type="button" class="close" data-dismiss="alert">×</button>\
                            You are not authorized to view this page\
                        </div>')
                }
            });
        };


    function doAddDetail (category) {
        $('#message').empty();
        var category_url = category.replace("-", "");
        if (!window.FormData) {
            alert('Your browser does not support AJAX multipart form submissions');
            return;
        }

        tinymce.triggerSave()

        $.ajax({
           
            url: 'api/' + category_url,
            type: 'POST',

            // Form data
            data: new FormData($('#' + category + '_add_form')[0]),

            // Tell jQuery not to process data or worry about content-type
            // You *must* include these options!
            cache: false,
            contentType: false,
            processData: false,

            // Custom XMLHttpRequest
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    // For handling the progress of the upload
                    myXhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            $('progress').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                        }
                    } , false);
                }
                return myXhr;
            },
        }).fail(function(response) {
                $('#message').append('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                $('#message').append('\
                    <div class="alert alert-dismissible alert-success" id="alert_success_edit">\
                        <button type="button" class="close" data-dismiss="alert">&times;</button>\
                        '+ to_singular(category.replace("-", " ")) + ' was added successfully!\
                    </div>')
            })

            //go to the top of the page
            $("html, body").animate({ scrollTop: 0 }, 'slow');
    }

    
    function doEditDetail (category, id, item) {
        $('#message').empty();
        var category_url = category.replace("-", "");
        if (!window.FormData) {
            alert('Your browser does not support AJAX multipart form submissions');
            return;
        }

        tinymce.triggerSave()

        var formData = new FormData($('#' + category + '_edit_form')[0])

        var formDataPatch = findFormChangedValues(item, formData);

        // If no image is selected, don't remove the old one
        if ($('#img').get(0).files.length === 0) {
            formDataPatch.delete('img');
        }
        
        $.ajax({
           
            url: 'api/' + category_url + '/' + id + '/',
            type: 'PATCH',

            // Form data
            data: formDataPatch,

            // Tell jQuery not to process data or worry about content-type
            // You *must* include these options!
            cache: false,
            contentType: false,
            processData: false,

            // Custom XMLHttpRequest
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    // For handling the progress of the upload
                    myXhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            $('progress').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                        }
                    } , false);
                }
                return myXhr;
            },
        }).fail(function(response) {
                $('#message').append('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                $('#message').append('\
                    <div class="alert alert-dismissible alert-success">\
                        <button type="button" class="close" data-dismiss="alert">&times;</button>\
                        '+ to_singular(category.replace("-", " ")) + ' was updated successfully!\
                    </div>')
            })

            //go to the top of the page
            $("html, body").animate({ scrollTop: 0 }, 'slow');
    }


    function doLogin() {
       $('#message').empty();
       data = $('#login_form').serialize();
       username = $('#username_input').val();
       $.ajax({
            url: 'api/rest-auth/login/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-login').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#LoginModal').modal('hide');
                getCurrentUser()
            })     
    };


    function doRegister() {
       var data = $('#reg_form').serialize();
       var email = $('#reg_email_input').val();
       $.ajax({
            url: 'api/rest-auth/registration/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-reg').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#RegModal').modal('hide');
                $('#VerifyEmailModal').modal('show');
                $('#modal-body-verify-email').prepend('\
                <div class="alert alert-dismissible alert-success">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    A confirmation email has been sent to <strong>'+ email +'</strong>\
                </div>')
            })     
    };


    function doChangePassword() {
       var data = $('#change_pass_form').serialize();
       $.ajax({
            url: 'api/rest-auth/password/change/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-change-pass').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#ChangePassModal').modal('hide');
                $('#message').append('\
                <div class="alert alert-dismissible alert-success">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    Your password has been changed!\
                </div>')
            })     
    };

    function goResetPassword() {
       var email = $('#res_pass_email_input').val();
       var data = $('#reset_pass_form').serialize();
       $.ajax({
            url: 'api/rest-auth/password/reset/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-reset-pass').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#ResetPassModal').modal('hide');
                $('#DoResetPassModal').modal('show');
                $('#modal-body-do-reset-pass').prepend('\
                <div class="alert alert-dismissible alert-success">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    An email has been sent to <strong>'+ email +'</strong>\
                </div>')
            })     
    };

    function doResetPassword() {
       var data = $('#do_reset_pass_form').serialize();
       $.ajax({
            url: 'api/rest-auth/password/reset/confirm/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-do-reset-pass').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#DoResetPassModal').modal('hide');
                $('#modal-body-do-reset-pass').append('\
                <div class="alert alert-dismissible alert-success">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    Your password has been reset!\
                </div>')
            })     
    };

    function doVerifyEmail() {
       var data = $('#verify_email_form').serialize();
       $.ajax({
            url: 'api/rest-auth/registration/verify-email/',
            type: 'POST',
            data: data,
        }).fail(function(response) {
                $('#modal-body-reset-pass').prepend('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#VerifyEmailModal').modal('hide');
                $('#message').append('\
                <div class="alert alert-dismissible alert-success">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    Your email was verified successfully!\
                </div>')
            })     
    };


    function signOut() {
        $('#message').empty();
        $.ajax({
            url: 'api/rest-auth/logout/',
            type: 'POST',
        }).fail(function(response) {
                $('#message').append('\
                <div class="alert alert-dismissible alert-danger">\
                    <button type="button" class="close" data-dismiss="alert">×</button>\
                    <strong>Request failed: </strong>' + JSON.stringify(response) +'\
                </div>')
        })
          .done(function() {
                current_user = null;
                window.location.replace(SITE_URL)
            }) 
    }

    function findFormChangedValues(item, formData) {
        Object.keys(item).forEach(function(key,index) {
                                 if (formData.get(key) === item[key]) {
                                    formData.delete(key);
                                }
                            });
        return formData
    }

    function safe_get_img(value) {
        return value ? value : DEFAULT_PIC;
    }

    function to_singular(value) {
        var value = value.split("-")
        if (value.length == 1) {
            return value[0].plural(true);
        } else {
            value[value.length - 1] = value[value.length - 1].plural(true);
            return value.join(' ')
        }
    }

    function clearTimeouts() {
        var id = window.setTimeout(function() {}, 0);

        while (id--) {
            window.clearTimeout(id); // will do nothing if no timeout with id is present
        }
    }

});







String.prototype.plural = function(revert){

    var plural = {
        '(quiz)$'               : "$1zes",
        '^(ox)$'                : "$1en",
        '([m|l])ouse$'          : "$1ice",
        '(matr|vert|ind)ix|ex$' : "$1ices",
        '(x|ch|ss|sh)$'         : "$1es",
        '([^aeiouy]|qu)y$'      : "$1ies",
        '(hive)$'               : "$1s",
        '(?:([^f])fe|([lr])f)$' : "$1$2ves",
        '(shea|lea|loa|thie)f$' : "$1ves",
        'sis$'                  : "ses",
        '([ti])um$'             : "$1a",
        '(tomat|potat|ech|her|vet)o$': "$1oes",
        '(bu)s$'                : "$1ses",
        '(alias)$'              : "$1es",
        '(octop)us$'            : "$1i",
        '(ax|test)is$'          : "$1es",
        '(us)$'                 : "$1es",
        '([^s]+)$'              : "$1s"
    };

    var singular = {
        '(quiz)zes$'             : "$1",
        '(matr)ices$'            : "$1ix",
        '(vert|ind)ices$'        : "$1ex",
        '^(ox)en$'               : "$1",
        '(alias)es$'             : "$1",
        '(octop|vir)i$'          : "$1us",
        '(cris|ax|test)es$'      : "$1is",
        '(shoe)s$'               : "$1",
        '(o)es$'                 : "$1",
        '(bus)es$'               : "$1",
        '([m|l])ice$'            : "$1ouse",
        '(x|ch|ss|sh)es$'        : "$1",
        '(m)ovies$'              : "$1ovie",
        '(s)eries$'              : "$1eries",
        '([^aeiouy]|qu)ies$'     : "$1y",
        '([lr])ves$'             : "$1f",
        '(tive)s$'               : "$1",
        '(hive)s$'               : "$1",
        '(li|wi|kni)ves$'        : "$1fe",
        '(shea|loa|lea|thie)ves$': "$1f",
        '(^analy)ses$'           : "$1sis",
        '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",
        '([ti])a$'               : "$1um",
        '(n)ews$'                : "$1ews",
        '(h|bl)ouses$'           : "$1ouse",
        '(corpse)s$'             : "$1",
        '(us)es$'                : "$1",
        's$'                     : ""
    };

    var irregular = {
        'move'   : 'moves',
        'foot'   : 'feet',
        'goose'  : 'geese',
        'sex'    : 'sexes',
        'child'  : 'children',
        'man'    : 'men',
        'tooth'  : 'teeth',
        'person' : 'people'
    };

    var uncountable = [
        'sheep',
        'fish',
        'deer',
        'moose',
        'series',
        'species',
        'money',
        'rice',
        'information',
        'equipment'
    ];

    // save some time in the case that singular and plural are the same
    if(uncountable.indexOf(this.toLowerCase()) >= 0)
      return this;

    // check for irregular forms
    for(word in irregular){

      if(revert){
              var pattern = new RegExp(irregular[word]+'$', 'i');
              var replace = word;
      } else{ var pattern = new RegExp(word+'$', 'i');
              var replace = irregular[word];
      }
      if(pattern.test(this))
        return this.replace(pattern, replace);
    }

    if(revert) var array = singular;
         else  var array = plural;

    // check for matches using regular expressions
    for(reg in array){

      var pattern = new RegExp(reg, 'i');

      if(pattern.test(this))
        return this.replace(pattern, array[reg]);
    }

    return this;
}