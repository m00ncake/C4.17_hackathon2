var activity_result = [];
var food_result = [];
var locations =[];
var counter = 0;
var addedFood = 0;
var addedActivity = 0;
var arrayCounter = 0;
var activityItinerary = [];
var foodItinerary = [];
var itineraryLocations= [];
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
    $('.cancel').click(taskCancelled);
    $('.complete').click(taskComplete);
    $('.thePlans').click(togglePlans);
});

function makeFirstCall(){
    $('body').css('background-image', 'url(https://cdn.dribbble.com/users/5661/screenshots/2491233/loading-gif-800x600.gif)');
    $('section').css('opacity', 0);
    $("#opening-page").hide();
    $("#main-page").show();
    getThingsToDo();
    getWeather();
}

function getThingsToDo(){
    var city = $('#city-input').val();
    $.ajax({
        method: 'get',
        dataType: 'json',
        url: 'http://localhost:3000/activities/' + city,
        success: function (response){
            data = response;
            createResultsArrays(data);
            getFoodSpots();
        },
        error: function (response){
            console.log(response);
        }
    });
}

function getFoodSpots(){
    var city = $('#city-input').val();
    $.ajax({
        method:'get',
        dataType: 'json',
        url: 'http://localhost:3000/food/' + city,
        success: function (response) {
            data = response;
            createResultsArrays(data);
            displayFoodList();
            displayActivityList();
            initMap();
        },
        error:function(response){
            console.log(response);
        }
    });
}

function getWeather(){
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

function createResultsArrays(data){
    for(var i = 0; i < 7; i++){
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

    if(addedFood === 3 && addedActivity === 3){
        map = new google.maps.Map(document.getElementById('mapTwo'), {
            center: {lat: 34.052235, lng: -118.243683},
            zoom: 13,
            styles: styles
        });
    }else{
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 34.052235, lng: -118.243683},
            zoom: 13,
            styles: styles
        });
    }

    // map = new google.maps.Map(document.getElementById('map'), {
    //     center: {lat: 34.052235, lng: -118.243683},
    //     zoom: 13,
    //     styles: styles
    // });
    // google.maps.event.trigger(map,'resize');

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
    // map.fitBounds(bounds);
    var listener = google.maps.event.addListener(map, "idle", function(){
        $('section').css('opacity', 1);
        $('body').css('background-image', '');
        google.maps.event.trigger(map,'resize');
        map.fitBounds(bounds);
        google.maps.event.removeListener(listener);
    });
}

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

/**
 * displayActivityList function - goes through global_result object and displays to the dom three targeted activities
 */
function displayActivityList(){
    for(var i = 0; i < 3; i++){
        var activity = activity_result[counter][i].image_url;
        var name = activity_result[counter][i].name;
        var address = activity_result[counter][i].location.address1;
        var type = activity_result[counter][i].categories[0].title;
        var phone = activity_result[counter][i].display_phone;
        var lat = activity_result[counter][i].coordinates.latitude;
        var lng = activity_result[counter][i].coordinates.longitude;
        var addButton = $('<span>',{
            // text: 'Add',
            class: ' glyphicon glyphicon-plus-sign addActivity'
        }).click(addActivity);
        $(addButton).data('name', {
            picture: activity,
            activityName: name,
            activityAddress: address,
            activityType: type,
            activityPhone: phone,
            activityLat: lat,
            activityLng: lng
        });
        if(activityItinerary.length > 0){
            for(var e = 0; e < activityItinerary.length; e++){
                if(activityItinerary[e].activityName === name){
                    // $(addButton).css('border', '.1em solid red').text('Remove');
                    $(addButton).removeClass('glyphicon-plus-sign');
                    $(addButton).addClass('glyphicon-remove-sign');
                }
            }
        }
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
        var lat = food_result[counter][t].coordinates.latitude;
        var lng = food_result[counter][t].coordinates.longitude;
        var addButton = $('<span>',{
            // text: 'Add',
            class: 'glyphicon glyphicon-plus-sign addFood'
        }).click(addFood);
        $(addButton).data('name', {
            foodPicture: picture,
            foodName: name,
            foodAddress: address,
            foodPhone: phone,
            foodPrice: price,
            foodRating: rating,
            foodType: type,
            foodLat: lat,
            foodLng: lng
        });
        if(foodItinerary.length > 0){
            for(var i = 0; i < foodItinerary.length; i++){
                if(foodItinerary[i].foodName === name){
                    // $(addButton).css('border', '.1em solid red').text('Remove');
                    $(addButton).removeClass('glyphicon-plus-sign');
                    $(addButton).addClass('glyphicon-remove-sign');
                }
            }
        }
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
    var $city_name = $("<div>").css({"font-size":"1.5em", "color": "white"}).text(city);
    var $city_weather = $("<div>").css({"color": "#f0f1ee", "text-shadow": "2px 2px black"}).text(weather);
    var $image = "images/" + icon + ".jpg";
    var $city_temp = $("<div>").css({"font-size":"2em", "color": "white", "text-shadow": "2px 2px black"}).text(temp +"°");
    $weather.append($city_name, $city_weather, $city_temp);
    $weather.css("background-image", "url(" + $image + ")");

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
    $('#city-input').val('');
    newBackground();
}

function newPlans(){
    if($(this).text() === 'Previous' && counter === 0) {
        return;
    }else if($(this).text() === 'Previous' && counter !== 0) {
        counter--;
    }else if($(this).text() === 'Next' && counter === 5){
        return;
    }else {
        counter++;
    }
    map;
    locations =[];
    markers = [];
    displayActivityList();
    displayFoodList();
    initMap();
}

function newBackground(){
    var background = Math.floor((Math.random() * 7) + 1);
    var result = "url(images/city_background_0" + background + ".jpg)";
    $('body').css('background-image', result);
}

function addFood(){
    var food = $(this).data().name;
    if($(this).hasClass('glyphicon-remove-sign')){
        $(this).removeClass('glyphicon-remove-sign');
        $(this).addClass('glyphicon-plus-sign');
        removeFromFoodItinerary(food);
        return;
    }
    if(addedFood === 3){
        return;
    }
    $(this).removeClass('glyphicon-plus-sign');
    $(this).addClass('glyphicon-remove-sign');
    foodItinerary.push(food);
    addedFood++;
    if(addedActivity === 3 && addedFood === 3){
        displayItinerary();
        $('#main-page').hide();
        $('#itinerary').show();
    }
}

function addActivity(){
    var activity = $(this).data().name;
    if($(this).hasClass('glyphicon-remove-sign')){
        $(this).removeClass('glyphicon-remove-sign');
        $(this).addClass('glyphicon-plus-sign');
        removeFromActivityItinerary(activity);
        return;
    }
    if(addedActivity === 3){
        return;
    }
    $(this).removeClass('glyphicon-plus-sign');
    $(this).addClass('glyphicon-remove-sign');
    activityItinerary.push(activity);
    addedActivity++;
    if(addedActivity === 3 && addedFood === 3){
        displayItinerary();
        $('#main-page').hide();
        $('#itinerary').show();
    }
}

function displayItinerary(){
    var i = 0;
    var e = 0;
    activityItinerary.forEach(function(item){
        $('.activityName' + i).text(item.activityName);
        $('.activityAddress' + i).text(item.activityAddress);
        $('.activityPhone' + i).text(item.activityPhone);
        itineraryLocations.push({title: item.activityName, location: {lat: item.activityLat, lng: item.activityLng}});
        i++;
    });
    foodItinerary.forEach(function(item){
        $('.foodName' + e).text(item.foodName);
        $('.foodAddress' + e).text(item.foodAddress);
        $('.foodPhone' + e).text(item.foodPhone);
        itineraryLocations.push({title: item.foodName, location: {lat: item.foodLat, lng: item.foodLng}});
        e++;
    });
    var city = $('<div>').text($('#city-input').val());
    var date = $('<div>').text(new Date().toDateString());
    var heading = $('<h2>').text('Itinerary');
    $('.itineraryHeading').append(heading, city, date);
    locations = itineraryLocations;
    initMap();
}

function removeFromFoodItinerary(item){
    var name = item.foodName;
    for(var i = 0; i < foodItinerary.length; i++){
        if(name === foodItinerary[i].foodName){
            foodItinerary.splice(i, 1);
            break;
        }
    }
    addedFood--;
}

function removeFromActivityItinerary(item){
    var name = item.activityName;
    for(var i = 0; i < activityItinerary.length; i++){
        if(name === activityItinerary[i].activityName){
            activityItinerary.splice(i, 1);
            break;
        }
    }
    addedActivity--;
}
function taskCancelled(){
    $(this).closest("div").hide();
}

function taskComplete(e){
    console.log('button clicked');
    console.log(e.target);
    var ownId = this.id;
    $("." + ownId).css("background-image", "url(https://s-media-cache-ak0.pinimg.com/originals/d2/90/6d/d2906d07f5392c97c58c41f29a28eba2.jpg)");
    $("." + ownId).addClass('reopen');
}

function taskComplete(){
    $(this).closest("div").toggleClass("backgroundImage");
}

function togglePlans(){
    var plans = this;
    var item = $(plans).children('a');
    if($(item).text() === 'Food Plans'){
        $('.activityPlans').hide();
        $('.foodPlans').show();
        $('li').removeClass('active');
        $(plans).addClass('active');
    }else{
        $('.activityPlans').show();
        $('.foodPlans').hide();
        $('li').removeClass('active');
        $(plans).addClass('active');
    }
}
