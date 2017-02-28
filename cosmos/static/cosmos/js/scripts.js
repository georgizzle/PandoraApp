var $ = require('jquery')
// to include js masonry again:
//var jQueryBridget = require('jquery-bridget');
//var Masonry = require('masonry-layout');
// make Masonry a jQuery plugin
//jQueryBridget( 'masonry', Masonry, $ );

$(document).ready(function(){

    var categories = ["kingdoms", "majorevents", "locations"]

    $.ajax( "api/categories" )
    .done(function(data) {
    if (data.length == 0) {
     $('#main-content').append('<p>The are no data (Yet)</p>');
    } else {
        data.forEach(function(item) {
                    var name_attr = item.name.replace(" ", "").toLowerCase();
                    $('#main-content').append('\
                        <div class="card" style="width: 20rem;">\
                          <img class="img-thumbnail" src="media/'+ item.img + '" alt="Card image cap">\
                          <div class="card-block">\
                            <h4 class="card-title">' + item.name + '</h4>\
                            <p class="card-text">' + item.desc + '</p>\
                          </div>\
                            <a href="#" class ="view-category" id= "'+ name_attr + '">\
                                <div class="card-footer">\
                                  <small class="text-muted">See ' + item.name + '</small>\
                                </div>\
                            </a>\
                        </div>');
                })
            }
    })

    $('#main-content').on('click', '.view-category', function (e) {
            e.preventDefault();
            var category = $(this).attr('id');
            $.ajax( "api/" + category)
            .done(function(data) {
            $('#main-content').empty();
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
                                  </div>\
                                    <a href="#" class="item-detail" id= "' + category + '_' + item.id +'">\
                                        <div class="card-footer">\
                                          <small class="text-muted">See ' + item.name + ' details</small>\
                                        </div>\
                                    </a>\
                                </div>');
                        })
                    }
           })

    })


        $('#main-content').on('click', '.item-detail', function (e) {
            e.preventDefault();
            var category = $(this).attr('id').split("_")[0]
            var id       = $(this).attr('id').split("_")[1]
            $.ajax( "api/" + category + "/" + id )
            .done(function(data) {
            $('#main-content').empty();
            if (data.length == 0) {
             $('#main-content').append('<p>Oops! There was an error!</p>');
            } else {
                    var item = data;

                            if (category == "kingdoms") {
                                $('#main-content').append('\
                                    <div class="card" style="width: 20rem;">\
                                      <img class="img-thumbnail" src="media/'+ safe_get(item.img) + '" alt="Card image cap">\
                                      <div class="card-block">\
                                        <h4 class="card-title">' + safe_get(item.name) + '</h4>\
                                        <p class="card-text">' + safe_get(item.desc) + '</p>\
                                      </div>\
                                      <div class="card-block">\
                                      <h4 class="card-title">History</h4>'
                                      + safe_get(item.history) + '</div>\
                                      <div class="card-block">\
                                        <h4 class="card-title">Geography</h4>\
                                        <p class="card-text">' + safe_get(safe_get(item.geography).type) + '</p>\
                                        <p class="card-text">' + safe_get(safe_get(item.geography).desc) + '</p>\
                                      </div>\
                                      <div class="card-block">\
                                        <h4 class="card-title">Other Info</h4>\
                                        <p class="card-text">' + safe_get(item.other_info) + '</p>\
                                      </div>\
                                      <button type="button" class="btn btn-info btn-lg" id="myBtn">Edit</button>\
                                </div>');

                                $('#main-content').append('\
                                      <div class="modal fade" id="myModal" role="dialog">\
                                        <div class="modal-dialog">\
                                          <div class="modal-content">\
                                            <div class="modal-header">\
                                              <button type="button" class="close" data-dismiss="modal">&times;</button>\
                                              <h4 class="modal-title">Modal Header</h4>\
                                            </div>\
                                            <div class="modal-body">\
                                              <p>Some text in the modal.</p>\
                                            </div>\
                                            <div class="modal-footer">\
                                              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                                            </div>\
                                          </div>\
                                        </div>\
                                      </div>');

                                 $("#main-content").on('click', '#myBtn', function(){
                                       $("#myModal").modal();
                                 });


                        };
                }

           })

    })

    function safe_get(value) {
        return value ? value : "";
    }


});