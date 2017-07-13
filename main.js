var activity_result = [];
var food_result = [];
var locations =[];
var counter = 0;
var addedFood = 0;
var addedActivity = 0;
var arrayCounter = 0;
/**
 * document ready function adding click handler to submit button.
 * Runs AJAX call to retrieve Yelp activity options -- set response to golbal_result variable
 */
$(document).ready(function(){
    $("#main-page").hide();
    $("#itinerary").hide();
    $("#changeCity").click(changeCity);
    $("#previousPlans").click(newPlans);
    $("#nextPlans").click(newPlans);
    $('.submit').click(makeFirstCall);
});

function makeFirstCall(){
    $('body').css('background-image', 'url(https://68.media.tumblr.com/tumblr_m8av4xP06U1qiv9upo1_500.gif)');
    $('section').css('opacity', 0);
    $("#opening-page").hide();
    $("#main-page").show();
    ajaxOne();
    ajaxThree();
}

function ajaxOne(){
    // var city = $('#city-input').val();
    $.ajax({
        method: 'get',
        dataType: 'json',
        // url: 'http://localhost:3000/activities/' + city,
        url: 'yelpServer.php',
        data: {
            'location': $('#city-input').val(),
            'term': 'Things to do'
        },
        success: function (response){
            // activity_result = response;
            data = response;
            modArray();
            ajaxTwo();
        },
        error: function (response){
            console.log(response);
        }
    });
}

function ajaxTwo(){
    // var city = $('#city-input').val();
    $.ajax({
        method:'get',
        dataType: 'json',
        // url: 'http://localhost:3000/food/' + city,
        url: 'yelpServer.php',
        data: {
            'location': $('#city-input').val(),
            'term': 'Food'
        },
        success: function (response) {
            // food_result = response;
            data = response;
            modArray();
            displayFoodList();
            displayAcvtivtyList();
            initMap();
        },
        error:function(response){
            console.log(response);
        }
    });
}

function ajaxThree(){
    var citySelected = $("#city-input").val();
    $.ajax({
        dataType: "json",
        data:{
            APPID: '52ea1802f2e0fd3ef3a1708f1b6f52b6',
            units: "imperial",
            q: citySelected
        },
        url: "http://api.openweathermap.org/data/2.5/weather",
        method: "get",
        success: function(response){
            var cityName = response.name;
            var cityWeather = response.weather[0].description;
            var weatherIcon = response.weather[0].icon;
            var cityTemp = Math.floor(response.main.temp);
            updateWeather(cityName, cityWeather, weatherIcon, cityTemp);
        },
        error: function(response){
            console.log(response);
        }
    });
}

function modArray(){
    for(var i = 0; i < 10; i++){
        var newArray = [];
        for(var e = 0; e < 3; e++){
            newArray.push(data[e]);
        }
        data.splice(0,3);
        if(arrayCounter % 2 === 0){
            activity_result.push(newArray);
        }else{
            food_result.push(newArray);
        }
    }
    arrayCounter++;
}


/**
 * function initMap creates map using googlemap api, displays map on page and sets markers in target locations
 * creates infoWindows when clicked display location details.
 */
var map;
var markers = [];
function initMap() {
    var styles = [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#444444"
                }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#f8ac00"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#f2f2f2"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#ecc646"
                },
                {
                    "visibility": "on"
                }
            ]
        }
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.052235, lng: -118.243683},
        zoom: 13,
        styles: styles
    });
    google.maps.event.trigger(map,'resize');

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    for(var i = 0; i < locations.length; i++){
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            id: i
        });
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener("click", function(){
            populateInfoWindow(this, largeInfowindow);
        });
    }
    map.fitBounds(bounds);
    function populateInfoWindow(marker, infowindow){
        if(infowindow.marker != marker){
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function(){
                infowindow.setMarker(null);
            });
        }
    }
    var listener = google.maps.event.addListener(map, "idle", function(){
        $('section').css('opacity', 1);
        $('body').css('background-image', '');
        google.maps.event.removeListener(listener);
    });
}
/**
 * displayActivityList function - goes through global_result object and displays to the dom three targeted activities
 */
function displayAcvtivtyList(){
    for(i=0; i<=2; i++){
        var activity = activity_result[counter][i].image_url;
        var name = activity_result[counter][i].name;
        var address = activity_result[counter][i].location.address1;
        var type = activity_result[counter][i].categories[0].title;
        var addButton = $('<button>',{
            text: 'Add',
            class: 'addActivity'
        }).click(addActivity);
        $(addButton).data('name', {picture: activity, activityName: name, activityAddress: address, activityType: type});
        $(".activity" + i).css("background-image","url(" + activity + ")");
        $(".description" + i).html('<b>' + name + '</b>' +'<br>'+ type + '<br>' + address).append(addButton);
        locations.push({title: activity_result[counter][i].name, location: {lat: activity_result[counter][i].coordinates.latitude, lng: activity_result[counter][i].coordinates.longitude}});
    }
}
/**
 * displayFoodList function - goes through food_result object and displays to the dom three targeted restaurants
 */
function displayFoodList(){
    for(var t = 0; t < 3; t++){
        var name = food_result[counter][t].name;
        var address = food_result[counter][t].location.address1;
        var phone = food_result[counter][t].display_phone;
        var price = food_result[counter][t].price;
        var rating = food_result[counter][t].rating;
        var type = food_result[counter][t].categories[0].title;
        var picture = food_result[counter][t].image_url;
        var addButton = $('<button>',{
            text: 'Add',
            class: 'addFood'
        }).click(addFood);
        $('.food' + t).css("background-image","url(" + picture + ")");
        $('.food-info' + t).html('<b>' + name + '</b>' + '<br>' + price + " - " + rating + ' ' + '&#x2605' + '<br>' + type + '<br>' + address + '<br>' + phone).append(addButton);
        locations.push({title: food_result[counter][t].name, location: {lat: food_result[counter][t].coordinates.latitude, lng: food_result[counter][t].coordinates.longitude}});
    }
}
/**
 * updateWeather function takes three params draws information from weather api and displays target city information on page
 * @param city
 * @param weather
 * @param icon
 * @param temp
 */
function updateWeather(city, weather, icon, temp) {
    var $weather = $("#weather");
    var $city_name = $("<div>").css({"font-size":"30px", "color": "white"}).text(city);
    var $city_weather = $("<div>").css({"color": "#f0f1ee", "text-shadow": "#cacaca"}).text(weather);
    var $image = "images/" + icon + ".jpg";
    $weather.css("background-image", "url(" + $image + ")");
    var $city_temp = $("<div>").css({"font-size":"60px", "color": "white"}).text(temp +"°");
    var $weather_icon = $("<img>").attr("src",$image);
    $weather.append($city_name, $city_weather, $city_temp);
}

function changeCity(){
    counter = 0;
    morePlans = true;
    activity_result = [];
    food_result = [];
    locations =[];
    map;
    markers = [];
    $("#weather div").remove();
    $("#weather img").remove();
    $("#opening-page").show(1000);
    $("#main-page").hide(1100);
    newBackground();
    $('#city-input').val('');
}

function newPlans(){
    if($(this).text() === 'Previous' && counter === 0) {
        return;
    }else if($(this).text() === 'Previous' && counter !== 0) {
        counter--;
    }else if($(this).text() === 'Next' && counter === 9){
        return;
    }else {
        counter++;
    }
    map;
    locations =[];
    markers = [];
    displayAcvtivtyList();
    displayFoodList();
    initMap();
}

function newBackground(){
    var background = Math.floor((Math.random() * 7) + 1);
    var result = "url(images/city_background_0" + background + ".jpg)";
    $('body').css('background-image', result);
}

function addFood(){
    console.log('food working');
}

function addActivity(){
    var activity = $(this).data().name;
    switch(addedActivity){
        case 0:
            $('.activityAdded0').html(activity.activityName);
            break;
        case 1:
            $('.activityAdded1');
            break;
        case 2:
            $('.activityAdded2');
            break;
    }
    $('#main-page').hide();
    $('#itinerary').show();
}

// function displayAcvtivtyList(){
//     for(i=0; i<=2; i++){
//         var e = Math.floor(Math.random() * global_result.length);
//         var activity = global_result[e].image_url;
//         $(".activity" + i).css("background-image","url(" + activity + ")");
//         var name = global_result[e].name;
//         var address = global_result[e].location.address1;
//         var type = global_result[e].categories[0].title;
//         console.log(address);
//         $(".description" + i).html('<b>' + name + '</b>' +'<br>'+ type + '<br>' + address);
//         locations.push({title: global_result[e].name, location: {lat: global_result[e].coordinates.latitude, lng: global_result[e].coordinates.longitude}});
//         global_result.splice(e, 1);
//     }
// }

// function displayFoodList(){
//     for(var t = 0; t < 3; t++){
//         var p = Math.floor(Math.random() * food_result.length);
//         var name = food_result[p].name;
//         var address = food_result[p].location.address1;
//         var phone = food_result[p].display_phone;
//         var price = food_result[p].price;
//         var rating = food_result[p].rating;
//         var type = food_result[p].categories[0].title;
//         var picture = food_result[p].image_url;
//         var infoDiv = $('<div>',{
//             html: ('<b>' + name + '</b>' + '<br>' + price + " - " + rating + ' ' + '&#x2605' + '<br>' + type + '<br>' + address + '<br>' + phone)
//         });
//         $('.food' + t).css("background-image","url(" + picture + ")");
//         $('.food-info' + t).append(infoDiv);
//         locations.push({title: food_result[p].name, location: {lat: food_result[p].coordinates.latitude, lng: food_result[p].coordinates.longitude}});
//         food_result.splice(p, 1);
//         if(food_result.length === 0){
//             morePlans = false;
//         }
//     }
// }

// $(document).ready(function() {
//     $("#main-page").hide(500);
//     $("#changeCity").click(changeCity);
//     $("#previousPlans").click(newPlans);
//     $("#nextPlans").click(newPlans);
//     /**
//      * set click handler to submit button - AJAX call to Yelp for food data
//      * set response to food_result variable
//      * set locations to location array - call initMap function to create map
//      * set activities
//      */
//     $('.submit').click(function () {
//         $('body').css('background-image', 'url(https://s-media-cache-ak0.pinimg.com/originals/d3/59/1c/d3591c63b81ba14696e290f74743e1de.gif)');
//         $('section').css('opacity', 0);
//         console.log('click initiated');
//         $("#opening-page").hide(1000);
//         $("#main-page").show(1100);
//         $.ajax({
//             method:'get',
//             dataType: 'json',
//             url: 'yelpServer.php',
//             data: {
//                 'location': $('#city-input').val(),
//                 'term': 'Things to do'
//             },
//             success: function (response) {
//                 data = response;
//                 for(var i = 0; i < 10; i++){
//                     var newArray = [];
//                     for(var e = 0; e < 3; e++){
//                         newArray.push(data[e]);
//                     }
//                     data.splice(0,3);
//                     global_result.push(newArray);
//                 }
//                 console.log('it worked');
//                 $.ajax({
//                     method:'get',
//                     dataType: 'json',
//                     url: 'yelpServer.php',
//                     data: {
//                         'location': $('#city-input').val(),
//                         'term': 'Food'
//                     },
//                     success: function (response) {
//                         data = response;
//                         for(var i = 0; i < 10; i++){
//                             var newArray = [];
//                             for(var e = 0; e < 3; e++){
//                                 newArray.push(data[e]);
//                             }
//                             data.splice(0,3);
//                             food_result.push(newArray);
//                         }
//                         console.log('it worked');
//                         displayFoodList();
//                         displayAcvtivtyList();
//                         initMap();
//                     },
//                     error:function(response){
//                         console.log('url wrong');
//                     }
//                 });
//             },
//             error:function(response){
//                 console.log('url wrong');
//             }
//         });
//
//         /**
//          * AJAX call to weather api to retrieve weather of target location
//          * calls function updateWeather to display data on page
//          */
//         var citySelected = $("#city-input").val();
//         $.ajax({
//             dataType: "json",
//             data:{
//                 APPID: '52ea1802f2e0fd3ef3a1708f1b6f52b6',
//                 units: "imperial",
//                 q: citySelected
//             },
//             url: "http://api.openweathermap.org/data/2.5/weather",
//             method: "get",
//             success: function(response){
//                 console.log(response);
//                 var cityName = response.name;
//                 var cityWeather = response.weather[0].description;
//                 var weatherIcon = response.weather[0].icon;
//                 var cityTemp = Math.floor(response.main.temp);
//                 console.log(cityName, cityWeather, weatherIcon, cityTemp);
//                 updateWeather(cityName, cityWeather, weatherIcon, cityTemp);
//             },
//             error: function(response){
//                 console.log("didn't work");
//             }
//         });
//     });
//
// });