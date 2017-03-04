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
// to include js masonry again:
//var jQueryBridget = require('jquery-bridget');
//var Masonry = require('masonry-layout');
// make Masonry a jQuery plugin
//jQueryBridget( 'masonry', Masonry, $ );

var TIMEOUT = 30000;

$(document).ready(function(){


    $('img').on('click', function() {
        $('.enlargeImageModalSource').attr('src', $(this).attr('src'));
        $('#enlargeImageModal').modal('show');
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
        }
    }

    hasher.initialized.add(onHasherInit);
    hasher.initialized.add(parseHash); // parse initial hash
    hasher.changed.add(parseHash); //parse hash changes
    hasher.init(); //start listening for history change


    goHome()

    function goHome() {
        clearTimeouts()
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
                                  <img class="card-img-top img-responsive" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                                              <img class="card-img-top img-responsive" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                    //todo AUTH
                    if (true){
                        $('#main-content').append('<div class="card" style="width: 20rem;">\
                                <div class="card-block">\
                                    <a href="#/'+ category +'/add" id= "' + category + '_add">\
                                        <h4 class="card-title">Add new '+ category.replace("-", " ") +'</h4>\
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
                                  <img class="card-img-top img-responsive" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
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
                            //todo AUTH
                            if (true){
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
        clearTimeouts()
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
                        theme: "modern",
                        plugins: ['paste', 'link', 'autoresize', 'image'],
                        image_list: [
                            {title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
                            {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
                        ]
                    })
            });
        };


    function goEditDetail(category, id) {
        clearTimeouts()
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
                                    <small id="fileHelp" class="form-text text-muted">Upload an image. This image will be shown in '+ category.replace("-", " ") +'\' summary</small>\
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
            });

            //get details to prepopulate form elements
            $.ajax( 'api/' + category_url + '/' + id )
                        .done(function(item) {
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
        };


    function safe_get(value) {
        return value ? value : "";
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