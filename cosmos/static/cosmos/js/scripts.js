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
// to include js masonry again:
//var jQueryBridget = require('jquery-bridget');
//var Masonry = require('masonry-layout');
// make Masonry a jQuery plugin
//jQueryBridget( 'masonry', Masonry, $ );

$(document).ready(function(){

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

    crossroads.addRoute("{category}",function(category){
        goCategory(category);
    });

    crossroads.addRoute("{category}/add",function(category){
        goAddDetail(category);
    });

    crossroads.addRoute("{category}/{id}",function(category, id){
        goDetail(category, id);
    });


    //handle hash changes
    function parseHash(newHash, oldHash){
        crossroads.parse(newHash);
    }

    function onHasherInit(curHash){
        if (curHash == '') {
            // redirect to "home" hash without keeping the empty hash on the history
            hasher.replaceHash('home');
        }
    }

    hasher.initialized.add(onHasherInit);
    hasher.initialized.add(parseHash); // parse initial hash
    hasher.changed.add(parseHash); //parse hash changes
    hasher.init(); //start listening for history change


    goHome()

    function goHome() {
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
                                  <img class="card-img-top img-fluid" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                    var category_url = category.replace("-", "");
                    $.ajax( 'api/' + category_url)
                    .done(function(data) {
                    $('#main-content').empty();
                    if (data.length != 0) {
                        data.forEach(function(item) {
                                    $('#main-content').append('\
                                        <div class="card" style="width: 20rem;">\
                                          <img class="card-img-top img-fluid" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                                })
                    }
                    $('#main-content').append('<div class="card" style="width: 20rem;">\
                            <div class="card-block">\
                                <a href="#/'+ category +'/add" id= "' + category + '_add">\
                                    <h4 class="card-title">Add new '+ category.replace("-", " ") +'</h4>\
                                </a>\
                            </div>\
                            <div class="card-footer">\
                                <small class="text-muted">Viewable only from Moderators</small>\
                            </div>\
                    </div>')
                   })
    }


    function goDetail(category, id) {
            var category_url = category.replace("-", "");
            $.ajax( 'api/' + category_url + '/' + id )
            .done(function(item) {
                $('#main-content').empty();
                if (item.length == 0) {
                        $('#main-content').append('<p>Oops! There was an error!</p>');
                } else {
                        $('#main-content').append('\
                            <div class="card" style="width: 20rem;">\
                              <img class="card-img-top img-fluid" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                }

            });
    };


    function goAddDetail(category) {
        var category_url = category.replace("-", "");
        $.ajax({ url : 'api/' + category_url ,
                  method: 'OPTIONS'
            })
            .done(function(data) {

                var attributes = data.actions.POST

                $('#main-content').empty();

                $('#main-content').append('\
                        <div class="card" style="width: 20em;">\
                        </div>');

                $('#main-content > .card').append('<form id="'+ category +'_add_form"><fieldset></fieldset><button type="submit" class="btn btn-primary">Submit</button><form>')

                Object.keys(attributes).forEach(function(key,index) {

                    if (attributes[key]['required'] == true ) {

                        if (attributes[key]['type'] == 'string' && attributes[key].hasOwnProperty('max_length')) {
                            $('#' + category + '_add_form > fieldset').append(
                            '<div class="form-group">\
                              <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                              <input type="text" class="form-control" id="'+ key +'" maxlength="'+ attributes[key]['max_length'] +'">\
                            </div>'
                            )
                        } else if (attributes[key]['type'] == 'string') {
                            $('#' + category + '_add_form > fieldset').append(
                                '<div class="form-group">\
                                    <label for="'+ key +'">'+ attributes[key]['label'] +'</label>\
                                    <textarea class="form-control textarea-field" id="'+ key +'"></textarea>\
                                </div>'
                            )

                        } else if (attributes[key]['type'] == 'image upload') {
                            $('#' + category + '_add_form > fieldset').append(
                                '<div class="form-group">\
                                    <label for="'+ key +'">Upload Image</label>\
                                    <input type="file" class="form-control-file" id="'+ key +'" aria-describedby="fileHelp">\
                                    <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ category.replace("-", " ") +'\' cards</small>\
                                </div>'
                            )
                        }
                    }

                });
                    tinymce.remove();
                    tinymce.init({
                        selector: ".textarea-field",
                        theme: "modern"
                    })
            });
        };

    function safe_get(value) {
        return value ? value : "";
    }


});