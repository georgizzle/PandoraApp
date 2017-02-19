var $ = require('jquery')
// to include js masonry again:
//var jQueryBridget = require('jquery-bridget');
//var Masonry = require('masonry-layout');
// make Masonry a jQuery plugin
//jQueryBridget( 'masonry', Masonry, $ );

$(document).ready(function(){

    // jQuery methods go here...
    $.ajax( "categories" )
    .done(function(data) {
    console.log(data);
    if (data.length == 0) {
     $('#main-content').append('<p>The are no data (Yet)</p>');
    } else {
        data.forEach(function(item) {
            $('#main-content').append('\
                <div class="card" style="width: 20rem;">\
                  <img class="img-thumbnail" src="media/'+ item.img + '" alt="Card image cap">\
                  <div class="card-block">\
                    <h4 class="card-title">' + item.name + '</h4>\
                    <p class="card-text">' + item.desc + '</p>\
                    <button type="button" class="btn btn-secondary" id="Add_'+item.name+'" data-toggle="modal" data-target="#ModalLoginForm">Add ' + item.name + '\
                    </button>\
                  </div>\
                    <a href="#">\
                        <div class="card-footer">\
                          <small class="text-muted">See ' + item.name + '</small>\
                        </div>\
                    </a>\
                </div>');
        })
    }
    })


});