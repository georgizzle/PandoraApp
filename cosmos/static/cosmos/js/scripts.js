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


var TIMEOUT = 120000;
var DEFAULT_PIC = "pictures/Erevos_world_map.png";
var MODERATOR_GROUP = "Moderators"
var current_user = null;
var category_nav = false;
var USE_TEMPLATES = true;
var fields_shown = ["name", "summary", "description"]
var summary_image_edit = true;
var active_inputs = 0;
var links = [];


$(document).ready(function(){

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = $.trim(cookies[i]);
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
        if (current_user == null) {

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
                    $('#navbarColor01').append('<ul class="navbar-nav">\
                        <li class="nav-item dropdown">\
                            <a class="nav-link dropdown-toggle" id="loggedin" data-toggle="dropdown" href="#">' + current_user.username +'</a>\
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="loggedin">\
                                <a class="dropdown-item" id ="signout_link" href="#/account/signout">Sign out</a>\
                                <a class="dropdown-item" id ="change_pass_link" href="#">Change Password</a>\
                            </div>\
                        </li>\
                        </ul>');
                })  
        } 
    };

    function makeLinks() {
        if (links.length == 0) {
            $.ajax({
                url: 'api/allelements',
                type: 'GET'
            }).fail(function(response) {
                console.log('Couldn\'t obtain elements');
                return null;
            })
            .done(function(elements) {
                    links = elements;
                    replaceLinks();
            });
        }

        replaceLinks();
    };
    
    function replaceLinks() {
        $.each(links, function(index, link) {
            $('.card-text:not(a)').each(
                function() {
                    var string = $(this).html();
                    var theRegex = new RegExp(link.name, 'gi'); 
                    $(this).html(string.replace(theRegex, function (word) { 
                                                                return '<a href="#/'+ link['category']['name'] + '/show/' +
                                                                link.id +'">'+ link.name + '</a>'
                                                            }));
            });
        });
    }

    function populateCategoryNav(){
        if (!category_nav) {
            $.ajax( 'api/categories' )
                .done(function(data) {
                    $('#categories-nav-list').empty();
                    data.forEach(function(item) {
                                var name_attr = item.name.replace(" ", "-").toLowerCase();
                                $('#categories-nav-list').append('\
                                    <a class="dropdown-item" id ="'+ name_attr + '-nav-link" href="#/'+ name_attr +'">' + item.name + '</a>\
                                ')
                            })
                });
            category_nav = true;
        }
    }

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

    crossroads.addRoute("{category}/show/{id}",function(category, name){
        goDetail(category, name, false);
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
        getCurrentUser()
        makeLinks()
        $.ajax( 'api/categories' )
            .done(function(data) {
            $('#main-content').empty();
            $('#categories-nav-list').empty();
            if (data.length == 0) {
             $('#main-content').append('<p>The are no data (Yet)</p>');
            } else {
                data.forEach(function(item) {
                            var name_attr = item.name.replace(" ", "-").toLowerCase();
                            $('#main-content').append('\
                                <div class="card" style="width: 20rem;">\
                                  <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.summary_image) + '" alt="Card image cap">\
                                  <div class="card-block">\
                                    <h4 class="card-title">' + item.name + '</h4>\
                                    <p class="card-text">' + item.summary + '</p>\
                                  </div>\
                                    <a href="#/'+ name_attr +'" class ="view-category" id= "'+ name_attr + '">\
                                        <div class="card-footer">\
                                          <small class="text-muted">See ' + item.name + '</small>\
                                        </div>\
                                    </a>\
                                </div>');
                            $('#categories-nav-list').append('\
                                <a class="dropdown-item" id ="'+ name_attr + '-nav-link" href="#/'+ name_attr +'">' + item.name + '</a>\
                            ')
                        })

                        category_nav = true;
                    }
                    makeLinks();
            });
    };


    function goCategory(category) {
        getCurrentUser();
        populateCategoryNav();
        $('#message').empty();
        clearTimeouts()
        $.ajax('api/elements/' + category)
        .done(function(data) {
        $('#main-content').empty();
        if (data.length != 0) {
            data.forEach(function(item) {
                        if (item.final) {
                            $('#main-content').append('\
                                <div class="card" style="width: 20rem;">\
                                    <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.summary_image) + '" alt="Card image cap">\
                                    <div class="card-block">\
                                    <h4 class="card-title">' + item.name + '</h4>\
                                    <div class="card-text">' + item.summary + '</div>\
                                    </div>\
                                    <a href="#/'+ category +'/show/'+ item.id +'" class="item-detail" id= "\
                                    ' + category + '_' + item.name.toLowerCase().replaceAll(" ", "-") +'">\
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
        makeLinks();
        setTimeout(function() {goCategory(category)}, TIMEOUT);
        }).fail(function(response) {
                $('#message').append('\
                    <div class="alert alert-dismissible alert-danger">\
                        <button type="button" class="close" data-dismiss="alert">×</button>\
                        <strong>Something went wrong: </strong>\
                    </div>');
                    Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#message>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
        });

    }


    function goDetail(category, id, keepMessage) {
            makeLinks()
            populateCategoryNav();
            getCurrentUser();
            if (!keepMessage) {
                $('#message').empty();
            }
            clearTimeouts()
            $.ajax( 'api/elements/' + category + '/' + id )
            .done(function(item) {
                $('#main-content').empty();
                if (item.detail == "Not Found.") {
                        $('#main-content').append('<p>Oops! There was an error!</p>');
                } else {
                        if (item.final) {
                            $('#main-content').append('\
                                <div class="card" style="width: 20rem;">\
                                <img class="card-img-top img-responsive" src="media/'+ safe_get_img(item.summary_image) + '" alt="Card image cap">\
                            </div>');
                            Object.keys(item).forEach(function(key,index) {
                                if (isInArray(key, fields_shown) ) {
                                    var read_only = 'editable'
                                    $('#main-content > .card').append('\
                                        <div class="card-block card-block-detail" id="' + key + '-' + read_only + '">\
                                        <div class="jumbotron card-title-detail">' + key.capitalizeFirstLetter() + '</div>\
                                        <div class="card-text">' + item[key] + '</div></div>')
                                }
                            });

                            var canEdit = null;

                            if (current_user != null && !item.old_version ) {
                                current_user.groups.forEach(function(item){ 
                                    if (item.name == MODERATOR_GROUP) { 
                                        canEdit = true; 
                                    }
                                });
                            }
                                    
                            if (canEdit) {
                                $('#main-content').wrap('<form id="' + category +'_' + id + 
                                    '_edit_form" enctype="multipart/form-data">\
                                    <form>');
                                $('#main-content > .card > .card-block-detail').each(function() {
                                    if ($(this).attr('id').split('-')[1] == 'editable') {
                                        $(this).find(">:first-child").append('<a\
                                        class="item-detail_edit float-right" href="javascript:void(0);" id= "edit_' + 
                                        category + '_' + id + '_' +
                                        $(this).attr('id').split('-')[0].replace('_' , '-') +'">\
                                        edit</a>')
                                    }
                                });

                                //add image upload form
                                if (summary_image_edit) {
                                    $('#main-content > .card').append('\
                                            <div class="card-block card-block-detail" id="summary_image-editable">\
                                            <div class="jumbotron card-title-detail"><a\
                                            class="item-detail_edit" href="javascript:void(0);" id= "edit_' + 
                                            category + '_' + id + '_summary-image">Edit summary image</a></div></div>')
                                    }

                                    $('#main-content > .card').append('<button class="btn btn-primary" id="edit-'+ 
                                        category +'_' + id + '-btn" style="display:none">Edit<button>');

                                    $('body').off().on('click', '.item-detail_edit', function() {
                                        $('.alert').remove();
                                        $(this).hide();
                                        active_inputs += 1
                                        goEditDetail($(this));
                                    });

                                    $('body').on('click', '#edit-'+ category +'_' + id + '-btn' , function(e) { 
                                        e.preventDefault();
                                        doEditDetail(category, id);
                                    })
                            }

                            makeLinks();

                        } else {
                            $('#message').append('\
                                <div class="alert alert-dismissible alert-danger">\
                                    <button type="button" class="close" data-dismiss="alert">×</button>\
                                    This element is not finalized yet\
                                </div>')
                        }
                }
            //we set timeout only if the page is not editable os it won't mess editing
            if (!canEdit) {
                setTimeout(function() {goDetail(category, name)}, TIMEOUT);
            }
        });
    };


   function goEditDetail(element) {
        $('#message').empty();
        clearTimeouts();
        var category = element.attr('id').split('_')[1]
        var id = element.attr('id').split('_')[2]
        var field = element.attr('id').split('_')[3].replace("-", "_")

        $.ajax({ url : 'api/elements/' + category + '/' + id,
                  method: 'OPTIONS'
            })
            .done(function(data) {

                if (data.hasOwnProperty('actions')) {

                    var attributes = data.actions.PUT

                    $.ajax('api/elements/' + category + '/' + id)
                        .done(function(item) {

                            var content_val = item[field]

                            $('#' + field + '-editable >.card-text').empty();

                            if (attributes[field]['type'] == 'string' && attributes[field].hasOwnProperty('max_length')) {
                                $('#' + field + '-editable').append(
                                        '<div class="form-group">\
                                        <input type="text" class="form-control" name= "'+ field +'" id="'+ field +'" maxlength="'+ attributes[field]['max_length'] +'">\
                                        </div>\
                                        <button type="button"\
                                        id="cancel-'+ field +'-btn"\
                                        class="btn btn-default"\
                                        >Cancel</button>');

                                $('#' + field).val(content_val);

                            } else if (attributes[field]['type'] == 'string') {
                                $('#' + field + '-editable').append(
                                        '<div class="form-group">\
                                        <textarea class="form-control  textarea-field" name= "'+ field +'"  id="'+ field +'"></textarea>\
                                        </div>\
                                        <button type="button"\
                                        id="cancel-'+ field +'-btn"\
                                        class="btn btn-default"\
                                        >Cancel</button>');

                                tinymce.remove('#' + field)

                                tinymce.init({
                                            selector: '#' + field,
                                            theme: "modern",
                                            plugins: ['paste', 'link', 'autoresize', 'image'],
                                            image_list: [
                                                {title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
                                                {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
                                            ]
                                        })

                                tinymce.get(field).setContent(content_val);

                            }  else if (attributes[field]['type'] == 'image upload') {
                                $('#' + field + '-editable').append(
                                    '<div class="form-group">\
                                        <input type="file" class="form-control-file"  name= "'+ field +'" id="'+ field +'" aria-describedby="fileHelp">\
                                        <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ to_singular(category) +'\' summary</small>\
                                    </div>\
                                    <button type="button"\
                                    id="cancel-'+ field +'-btn"\
                                    class="btn btn-default"\
                                    >Cancel</button>'
                                )
                            }

                            $('body').off('click', '#cancel-'+ field +'-btn')
                                    .on('click', '#cancel-'+ field +'-btn' , function(e) { 
                                        e.preventDefault();
                                        $(this).remove();
                                        //show edit button again
                                        $('#edit_' + category + '_' + id + '_' + field.replace("_", "-")).show();
                                        //remove form element
                                        $('#' + field ).parent().remove();
                                        $('#' + field + '-editable > .card-text').append(content_val);
                                        active_inputs -= 1
                                        checkNumberOfInputs(category, id);
                                        makeLinks();
                                    })


                    });

                } else {
                    $('#message').append('\
                        <div class="alert alert-dismissible alert-danger">\
                            <button type="button" class="close" data-dismiss="alert">×</button>\
                            You are not authorized to edit this element\
                        </div>')

                    $("html, body").animate({ scrollTop: 0 }, 'slow');
                }

                checkNumberOfInputs(category, id);
            });
    };

    function checkNumberOfInputs(category, id) {
            if (active_inputs > 0) {
                $('#edit-'+ category +'_' + id + '-btn').show();
            } else {
                $('#edit-'+ category +'_' + id + '-btn').hide();
            }
    }


   function doEditDetail (category, id) {
        $('#message').empty();
        if (!window.FormData) {
            alert('Your browser does not support AJAX multipart form submissions');
            return;
        }

        tinymce.triggerSave()

        var formData = new FormData($('#' + category +'_' + id +'_edit_form')[0])
        
        $.ajax({
           
            url: 'api/elements/' + category + '/' + id + '/',
            type: 'PATCH',

            // Form data
            data: formData,

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
                        <strong>Something went wrong: </strong>\
                    </div>');
                    Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#message>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
        })
          .done(function() {
                $('#message').append('\
                    <div class="alert alert-dismissible alert-success">\
                        <button type="button" class="close" data-dismiss="alert">&times;</button>\
                        '+ to_singular(category.replaceAll("-", " ")) + ' was updated successfully!\
                    </div>')
                goDetail(category, id, true)
            })

            //go to the top of the page
            $("html, body").animate({ scrollTop: 0 }, 'slow');
    }


    function goAddDetail(category) {
        populateCategoryNav();
        getCurrentUser();
        $('#message').empty();
        clearTimeouts()
        $.ajax({ url : 'api/elements/' + category ,
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

                    var description_exists = false;

                    Object.keys(attributes).forEach(function(key,index) {

                        if (attributes[key]['required'] == true) {

                            if (attributes[key]['type'] == 'string' && attributes[key].hasOwnProperty('max_length')) {
                                $('#' + category + '_add_form > fieldset').append(
                                '<div class="form-group">\
                                <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                <input type="text" class="form-control" name= "'+ key +'" id="'+ key +'" maxlength="'+ attributes[key]['max_length'] +'">\
                                </div>'
                                )
                            } else if (attributes[key]['type'] == 'string') {
                                if (key == 'description') {
                                    description_exists = true;
                                }
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
                                        <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ category.replaceAll("-", " ") +'\' cards</small>\
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

                         if (description_exists && USE_TEMPLATES) {
                                $.ajax({ url : 'api/categories/' + category ,
                                    method: 'GET'
                                }).done(function(response) {
                                    // Populating description with template
                                    tinymce.get('description').setContent(response.template);
                                    $('#' + category + '_add_form > fieldset').append('\
                                        <input type="hidden"  name= "category" id="category" value ="' + response.id + '">\
                                    ');

                                })
                        }

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


    function doAddDetail (category) {
        $('#message').empty();
        if (!window.FormData) {
            alert('Your browser does not support AJAX multipart form submissions');
            return;
        }

        tinymce.triggerSave()

        $.ajax({
           
            url: 'api/elements/' + category + '/',
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
                    <strong>Something went wrong: </strong>\
                </div>');
                Object.keys(response.responseJSON).forEach(function(key,index) {
                    $('#message>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                });
        })
          .done(function() {
                $('#message').append('\
                    <div class="alert alert-dismissible alert-success" id="alert_success_edit">\
                        <button type="button" class="close" data-dismiss="alert">&times;</button>\
                        '+ to_singular(category.replaceAll("-", " ")) + ' was added successfully!\
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-login>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
        })
          .done(function() {
                csrftoken = getCookie('csrftoken');
                $('#LoginModal').modal('hide');
                //getCurrentUser()
                window.location.reload();
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-reg>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-change-pass>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-reset-pass>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-do-reset-pass>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#modal-body-reset-pass>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
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
                    <strong>Something went wrong: </strong>\
                </div>')
                Object.keys(response.responseJSON).forEach(function(key,index) {
                        $('#message>div').append('<p>' + key + ' : ' + response.responseJSON[key] + '</p>');
                    });
        })
          .done(function() {
                current_user = null;
                window.location.reload();
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


String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};




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