var global_result;
var food_result;
var locations =[];
/**
 * document ready function adding click handler to submit button.
 * Runs AJAX call to retrieve Yelp activity options -- set response to golbal_result variable
 */
$(document).ready(function() {
    $("#main-page").hide(500);
    $("#changeCity").click(changeCity);
    $("#newPlans").click(newPlans);
    /**
     * set click handler to submit button - AJAX call to Yelp for food data
     * set response to food_result variable
     * set locations to location array - call initMap function to create map
     * set activities
     */
    $('.submit').click(function () {
        console.log('click initiated');
        $("#opening-page").hide(1000);
        $("#main-page").show(1100);
        $.ajax({
            method:'get',
            dataType: 'json',
            url: 'yelpServer.php',
            data: {
                'location': $('#city-input').val(),
                'term': 'Things to do'
            },
            success: function (response) {
                global_result = response;
                console.log('it worked');
                $.ajax({
                    method:'get',
                    dataType: 'json',
                    url: 'yelpServer.php',
                    data: {
                        'location': $('#city-input').val(),
                        'term': 'Food'
                    },
                    success: function (response) {
                        food_result = response;
                        console.log('it worked');
                        displayFoodList();
                        displayAcvtivtyList();
                        initMap();
                    },
                    error:function(response){
                        console.log('url wrong');
                    }
                });
            },
            error:function(response){
                console.log('url wrong');
            }
        });

        /**
         * AJAX call to weather api to retrieve weather of target location
         * calls function updateWeather to display data on page
         */
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
                console.log(response);
                var cityName = response.name;
                var cityWeather = response.weather[0].description;
                var weatherIcon = response.weather[0].icon;
                var cityTemp = Math.floor(response.main.temp);
                console.log(cityName, cityWeather, weatherIcon, cityTemp);
                updateWeather(cityName, cityWeather, weatherIcon, cityTemp);
            },
            error: function(response){
                console.log("didn't work");
            }
        });
    });

});
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
}
/**
 * displayActivityList function - goes through global_result object and displays to the dom three targeted activities
 */
function displayAcvtivtyList(){
    for(i=0; i<=2; i++){
        var e = Math.floor(Math.random() * global_result.length);
        var activity = global_result[e].image_url;
        $(".activity" + i).css("background-image","url(" + activity + ")");
        var name = global_result[e].name;
        var address = global_result[e].location.address1;
        var type = global_result[e].categories[0].title;
        console.log(address);
        $(".description" + i).html('<b>' + name + '</b>' +'<br>'+ type + '<br>' + address);
        locations.push({title: global_result[e].name, location: {lat: global_result[e].coordinates.latitude, lng: global_result[e].coordinates.longitude}});
        global_result.splice(e, 1);
    }
}
/**
 * displayFoodList function - goes through food_result object and displays to the dom three targeted restaurants
 */
function displayFoodList(){
    for(var t = 0; t < 3; t++){
        var p = Math.floor(Math.random() * food_result.length);
        var name = food_result[p].name;
        var address = food_result[p].location.address1;
        var phone = food_result[p].display_phone;
        var price = food_result[p].price;
        var rating = food_result[p].rating;
        var type = food_result[p].categories[0].title;
        var picture = food_result[p].image_url;
        var infoDiv = $('<div>',{
            html: ('<b>' + name + '</b>' + '<br>' + price + " - " + rating + ' ' + '&#x2605' + '<br>' + type + '<br>' + address + '<br>' + phone)
        });
        $('.food' + t).css("background-image","url(" + picture + ")");
        $('.food-info' + t).append(infoDiv);
        locations.push({title: food_result[p].name, location: {lat: food_result[p].coordinates.latitude, lng: food_result[p].coordinates.longitude}});
        food_result.splice(p, 1);
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
    // var $image = "http://openweathermap.org/img/w/" + icon + ".png";
    var $image = "images/" + icon + ".jpg";
    $weather.css("background-image", "url(" + $image + ")");
    console.log($image);
    var $city_temp = $("<div>").css({"font-size":"60px", "color": "white"}).text(temp +"°");
    var $weather_icon = $("<img>").attr("src",$image);
    console.log("weather: ",$city_weather,"city Name: ",$city_name,"weather icon: ", $weather_icon);
    $weather.append($city_name, $city_weather, $city_temp);
}

function changeCity(){
    global_result;
    food_result;
    locations =[];
    map;
    markers = [];
    $("#weather div").remove();
    $("#weather img").remove();
    for(var i = 0; i < 3; i++){
        $('.food-info' + i + ' div').remove();
    }
    $("#opening-page").show(1000);
    $("#main-page").hide(1100);
}

function newPlans(){
    map;
    locations =[];
    markers = [];
    for(var i = 0; i < 3; i++){
        $('.food-info' + i + ' div').remove();
    }
    displayAcvtivtyList();
    displayFoodList();
    initMap();
}


// $.ajax({
//     method:'get',
//     dataType: 'json',
//     url: 'sampleDataTwo.json',
//     success: function (response) {
//         global_result = response;
//         console.log('it worked');
//         displayAcvtivtyList();
//     },
//     error:function(response){
//         console.log('url wrong');
//     }
//
// })

// $('.submit').click(function () {
//     console.log('click initiated');
//     $.ajax({
//         method:'get',
//         dataType: 'json',
//         url: 'sampleDataThree.json',
//         success: function (response) {
//             food_result = response;
//             console.log('it worked');
//             displayFoodList();
//             locations = [
//                 {title: global_result[0].name, location: {lat: global_result[0].coordinates.latitude, lng: global_result[0].coordinates.longitude}},
//                 {title: global_result[1].name, location: {lat: global_result[1].coordinates.latitude, lng: global_result[1].coordinates.longitude}},
//                 {title: global_result[2].name, location: {lat: global_result[2].coordinates.latitude, lng: global_result[2].coordinates.longitude}},
//                 {title: food_result[0].name, location: {lat: food_result[0].coordinates.latitude, lng: food_result[0].coordinates.longitude}},
//                 {title: food_result[1].name, location: {lat: food_result[1].coordinates.latitude, lng: food_result[1].coordinates.longitude}},
//                 {title: food_result[2].name, location: {lat: food_result[2].coordinates.latitude, lng: food_result[2].coordinates.longitude}}
//             ];
//             initMap();
//         },
//         error:function(response){
//             console.log('url wrong');
//         }
//
//     })
// });
