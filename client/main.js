var activityLocations = [];
var foodLocations = [];
var activityPlaces = 0;
var foodPlaces = 0;

/**
 ** Function that makes the api calls once the user selects a city. Takes the user to the
 ** activities results page.
 **/

function makeApiCalls(){
    if($("#city-input").val() === ''){
        showError();
        return;
    }
    getThingsToDo();
    getWeather();
    $(".theCity").text($("#city-input").val());
    $("#navigation").show();
    $("#landingPage").hide();
    $("#activities").show();
}

/**
 ** The two functions below handle user input error. Accounts for no city entered or an invalid city entered.
 **/

function showError(){
    $(".errorMessage").show();
    setTimeout(function(){
        $(".errorMessage").hide();
    }, 2000);
}

function enterValidCity(){
    $("#navigation").hide();
    $("#activities").hide();
    $("#landingPage").show();
    showError();
    $("#city-input").val('');
}

/**
 ** Api call made to yelp for Things To Do in the selected city. On success
 ** the getFoodSpots and displayActivityResults is called.
 **/

function getThingsToDo() {
    var city = $('#city-input').val();
    $.ajax({
        method: 'get',
        dataType: 'json',
        url: 'http://daymaker.jonathanlimtiaco.com/activities/' + city,
        success: function (response){
            displayActivityResults(response);
            getFoodSpots();
        },
        error: function (response){
            console.log(response);
            enterValidCity();
        }
    });
}

/**
 ** Api call made to yelp for foods spots in the selected city. On success displayFoodResults is called.
 **/

function getFoodSpots() {
    var city = $('#city-input').val();
    $.ajax({
        method:'get',
        dataType: 'json',
        url: 'http://daymaker.jonathanlimtiaco.com/food/' + city,
        success: function (response) {
            displayFoodResults(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}

/**
 ** Api call made to openweather for the current weather of the selected city. On success updateWeather is called.
 **/

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
            var cityWeather = response.weather[0].description;
            var cityTemp = Math.floor(response.main.temp);
            updateWeather(cityWeather, cityTemp);
        },
        error: function(response){
            console.log(response);
            enterValidCity();
        }
    });
}

/**
 ** Displays the results from the yelp api request on the activity page.
 **/

function displayActivityResults(resultsArray){
    for(var i = 0; i < resultsArray.length; i++){
        var image = resultsArray[i].image_url;
        var name = resultsArray[i].name;
        var address = resultsArray[i].location.address1;
        var type = resultsArray[i].categories[0].title;
        var lat = resultsArray[i].coordinates.latitude;
        var lng = resultsArray[i].coordinates.longitude;
        $(".activity" + i).data("item", {
            activityImage: image,
            activityName: name,
            activityAddress: address,
            activityType: type,
            activityLat: lat,
            activityLng: lng
        });
        $(".activity" + i).click(showActivityModal);
        $(".activity" + i).text(name);
        $(".activity" + i).addClass("onHover");
    }
}

/**
 ** Displays the results from the yelp api request on the food page.
 **/

function displayFoodResults(resultsArray){
    for(var i = 0; i < resultsArray.length; i++){
        var name =resultsArray[i].name;
        var address = resultsArray[i].location.address1;
        var phone = resultsArray[i].display_phone;
        var price = resultsArray[i].price;
        var rating = resultsArray[i].rating;
        var type = resultsArray[i].categories[0].title;
        var picture = resultsArray[i].image_url;
        var lat = resultsArray[i].coordinates.latitude;
        var lng = resultsArray[i].coordinates.longitude;
        $(".food" + i).data("item", {
            foodName: name,
            foodAddress: address,
            foodPhone: phone,
            foodPrice: price,
            foodRating: rating,
            foodType: type,
            foodPicture: picture,
            foodLat: lat,
            foodLng: lng
        });
        $(".food" + i).click(showFoodModal);
        $(".food" + i).text(name);
        $(".food" + i).addClass("onHover");
    }
}

/**
 ** Populates the weather in degrees and description about the weather on the itinerary page.
 **/

function updateWeather(weather, temp) {
    $(".weatherDescription").text(weather);
    $(".weatherDegrees").text(temp +"°");

}

/**
 ** Gets called when user clicks on aa activity item from the results grid. Displays a modal with all the information about
 ** the activity selected.
 **/

function showActivityModal(){
    var item = $(this).data().item;
    var image = $('<img>').attr('src', item.activityImage);
    var name = $('<h3>').text(item.activityName);
    var address = $('<p>').text('Address: ' + item.activityAddress);
    var type = $('<p>').text('Activity Type: ' + item.activityType);
    var content = $('<div>').append(name, address, type);
    var span = $('<button class="btn btn-default" data-dismiss="modal">Add</button>').click(addActivity);
    $(span).data('activity',{
        name: item.activityName,
        image: item.activityImage,
        address: item.activityAddress,
        type: item.activityType,
        lat: item.activityLat,
        lng: item.activityLng
    });
    $('.modal-body, .modal-footer').empty();
    $(content, image).addClass('col-xs-12 col-md-6');
    $('.modal-body').append(content, image);
    $('#activityModal').modal('show');
    $('.modal-footer').append(span);
    $('.modal-title').text('Things To Do');
}

/**
 ** Gets called when user clicks on a food item from the results grid. Displays a modal with all the information about
 ** the restaurant selected.
 **/

function showFoodModal(){
    var item = $(this).data().item;
    var image = $('<img>').attr('src', item.foodPicture);
    var name = $('<h3>').text(item.foodName);
    var phone = $('<p>').text('Phone: ' + item.foodPhone);
    var price = $('<p>').text('Price Range: ' + item.foodPrice);
    var rating = $('<p>').text('Review Rating: ' + item.foodRating + ' / 5 stars');
    var address = $('<p>').text('Address: ' + item.foodAddress);
    var type = $('<p>').text('Food Type: ' + item.foodType);
    var content = $('<div>').append(name, type, address, phone, rating, price);
    var span = $('<button class="btn btn-default" data-dismiss="modal">Add</button>').click(addFood);
    $(span).data('food',{
        name: item.foodName,
        image: item.foodPicture,
        address: item.foodAddress,
        type: item.foodType,
        phone: item.foodPhone,
        price: item.foodPrice,
        rating: item.foodRating,
        lat: item.foodLat,
        lng: item.foodLng
    });
    $('.modal-body, .modal-footer').empty();
    $(content, image).addClass('col-xs-12 col-md-6');
    $('.modal-body').append(content, image);
    $('#activityModal').modal('show');
    $('.modal-footer').append(span);
    $('.modal-title').text('Food & Drink');
}

/**
 ** Gets called when user adds a activity item to their list.
 **/

function addActivity(){
    var activity = $(this).data().activity;
    activityLocations.push(activity);
    activityPlaces++;
    addToCurrentList(activity);
    if(activityPlaces === 3){
        $('#activities').hide();
        $('#foodPlaces').show();
        changeBackground();
        return;
    }
    displayCount();
}

/**
 ** Gets called when user adds a food item to their list.
 **/

function addFood(){
    var food = $(this).data().food;
    foodLocations.push(food);
    foodPlaces++;
    addToCurrentList(food);
    if(foodPlaces === 3){
        initMap();
        createItinerary();
        $('#foodPlaces').hide();
        $('#itinerary').show();
        $('.foodPlans').hide();
        $('.changePlans').hide();
        $('#navigation').hide();
        changeBackground();
        return;
    }
    displayCount();
}

/**
 ** Gets called when user adds or deletes and item from their list.
 **/

function displayCount(){
    if($('#activities').is(':visible')){
        switch (activityPlaces){
            case 1:
                $('.activityItems').text('Pick 2 Items');
                return;
            case 2:
                $('.activityItems').text('Pick 1 Item');
                return;
            default:
                $('.activityItems').text('Pick 3 Items');
                return;
        }
    }
    switch (foodPlaces){
        case 1:
            $('.foodItems').text('Pick 2 Items');
            return;
        case 2:
            $('.foodItems').text('Pick 1 Item');
            return;
        default:
            $('.foodItems').text('Pick 3 Items');
            return;
    }
}

/**
 ** Gets called and adds an item to their list. It creates an element which is displayed on the DOM. It is a way for the user to
 ** track the items they've selected.
 **/

function addToCurrentList(item){
    var newItem = $("<li>").text(item.name).addClass('list-group-item');
    var removeSign = $("<span>").addClass("pointer glyphicon glyphicon-remove-sign");
    $(removeSign).data("item", item);
    $(removeSign).click(removeFromList);
    $(newItem).append(removeSign);
    $('.currentList').append(newItem);
}

/**
 ** Gets called when user deletes an item from their list. It removes the item from the DOM and from the reference array
 **  used to keep track of activities selected.
 **/

function removeFromList(){
    var name = $(this).data().item;
    for(var i = 0; i < activityLocations.length; i++){
        if(activityLocations[i].name === name.name){
            activityLocations.splice(i, 1);
            activityPlaces--;
        }
    }
    for(var i = 0; i < foodLocations.length; i++){
        if(foodLocations[i].name === name.name){
            foodLocations.splice(i, 1);
            foodPlaces--;
        }
    }
    $(this).parent('li').remove();
    displayCount();
}

/**
 ** Gets called when user has selected their activities. At least one activity must be selected for this to run,
 ** doesn't matter whether it's a 'Things to do' or 'food' activity.
 **/

function createItinerary(){
    var activities = 0;
    var food = 0;
    activityLocations.forEach(function(item){
        var name = $('<h4>').text(item.name);
        var address = $('<p>').text('Address: ' + item.address);
        var type = $('<p>').text('Activity Type: ' + item.type);
        var completeCheckMark = $('<span>').addClass('pointer glyphicon glyphicon-check').click(markComplete);
        $('.activityAdded' + activities).append(name, address, type, completeCheckMark);
        activities++;
    });
    foodLocations.forEach(function(item){
        var name = $('<h4>').text(item.name);
        var phone = $('<p>').text('Phone & Address: ' + item.phone+' | '+item.address);
        var type = $('<p>').text('Food Type: ' + item.type);
        var price = $('<p>').text('Price Range & Review Rating: ' + item.price + ' | ' + item.rating + ' / 5 stars');
        var completeCheckMark = $('<span>').addClass('pointer glyphicon glyphicon-check').click(markComplete);
        $('.foodAdded' + food).append(name, type, phone, price, completeCheckMark);
        food++;
    });
    plansPlaceHolder();
    $('.date').text(new Date().toDateString());
    $('.city').text($('#city-input').val());
}

/**
 ** Gets called when user marks a plan as complete by clicking the checklist icon. Puts a line through all text.
 **/

function markComplete(){
    var parentElement = $(this).parent();
    $(parentElement).children('h4, p').toggleClass('strike');
}

/**
 ** Function that inserts a 'No Plans' placeholder if the  user selects less than three 'Activity Plans' or 'Food Plans'.
 **/

function plansPlaceHolder(){
    switch (foodPlaces){
        case 0:
            $(".foodAdded0, .foodAdded1, .foodAdded2").append($("<h4>").text('No Plans'));
            break;
        case 1:
            $(".foodAdded1, .foodAdded2").append($("<h4>").text('No Plans'));
            break;
        case 2:
            $(".foodAdded2").append($("<h4>").text('No Plans'));
            break;
    }
    switch (activityPlaces){
        case 0:
            $(".activityAdded0, .activityAdded1, .activityAdded2").append($("<h4>").text('No Plans'));
            break;
        case 1:
            $(".activityAdded1, .activityAdded2").append($("<h4>").text('No Plans'));
            break;
        case 2:
            $(".activityAdded2").append($("<h4>").text('No Plans'));
            break;
    }
}

/**
 ** Gets called when user toggles between 'Activity Plans', 'Food Plans', or 'Edit Itinerary' on the Itinerary page.
 **/

function togglePlans(){
    var clickedElement = $(this).children('a');
    if($(clickedElement).text() === 'Food Plans'){
        $('li').removeClass('active');
        $(this).addClass('active');
        $('.changePlans').hide();
        $('.activityPlans').hide();
        $('.foodPlans').show();
    }else if($(clickedElement).text() === 'Activity Plans'){
        $('li').removeClass('active');
        $(this).addClass('active');
        $('.foodPlans').hide();
        $('.changePlans').hide();
        $('.activityPlans').show();
    }else{
        $('li').removeClass('active');
        $(this).addClass('active');
        $('.foodPlans').hide();
        $('.activityPlans').hide();
        $('.changePlans').show();
    }
}

/**
 ** Gets called when user push the 'Change City' on the edit itinerary tab of the Itinerary page.
 **/

function changeCity(){
    $("#landingPage").show();
    $("#itinerary").hide();
    $('#city-input').val('');
    resetAll();
    clearInfo();
}

/**
 ** Gets called when user push the 'Change Activities' on the edit itinerary tab of the Itinerary page.
 **/

function changeActivities(){
    $("#activities").show();
    $("#navigation").show();
    $("#itinerary").hide();
    resetAll();
}

/**
 ** Gets called when user push the 'Change Food' on the edit itinerary tab of the Itinerary page.
 **/

function changeFood(){
    for(var i = 0; i < foodPlaces; i++){
        $(".currentList li:last-child").remove();
    }
    foodLocations = [];
    foodPlaces = 0;
    $("#foodPlaces").show();
    $("#navigation").show();
    $("#itinerary").hide();
    $(".foodPlans div, .activityPlans div").empty();
    $('li').removeClass('active');
    $('.nav-tabs li:first-child').addClass('active');
    $('.changePlans').hide();
    $('.activityPlans').show();
    $('.foodItems').text('Pick 3 Items');
    changeBackground();
}

/**
 ** Gets called when user push the 'next' button
 **/

function nextPage(){
    if($("#activities").is(":visible")){
        $("#activities").hide();
        $("#foodPlaces").show();
        changeBackground();
    }else if($("#foodPlaces").is(":visible") && (foodPlaces > 0 || activityPlaces > 0)){
        initMap();
        createItinerary();
        $('#foodPlaces').hide();
        $('#itinerary').show();
        $('.foodPlans').hide();
        $('.changePlans').hide();
        $('#navigation').hide();
        changeBackground();
    }else{
        $("#foodPlaces").hide();
        $("#navigation").hide();
        $("#landingPage").show();
        $("#city-input").val('');
        changeBackground();
        clearInfo();
    }
}

/**
 ** Gets called when user push the 'back' button. Either goes back to 'Things to do' page or 'Landing page'.
 **/

function previousPage(){
    if($("#activities").is(":visible")){
        resetAll();
        $("#activities").hide();
        $("#landingPage").show();
        $("#navigation").hide();
        $("#city-input").val('');
        changeBackground();
        clearInfo();
    }else{
        resetAll();
        $("#activities").show();
        $("#foodPlaces").hide();
        changeBackground();
    }
}

/**
 ** Gets called when user wants to create a new itinerary
 **/

function resetAll(){
    activityLocations = [];
    foodLocations = [];
    activityPlaces = 0;
    foodPlaces = 0;
    $(".foodPlans div").empty();
    $(".activityPlans div").empty();
    $('li').removeClass('active');
    $('.nav-tabs li:first-child').addClass('active');
    $('.changePlans').hide();
    $('.activityPlans').show();
    $('.activityItems, .foodItems').text('Pick 3 Items');
    $('.currentList').empty();
    changeBackground();
}

/**
 ** Gets called whenever the page changes and changes background image.
 **/

function changeBackground(){
    if($('#foodPlaces').is(':visible')){
        $('body').css('background', 'url(./images/food.png) no-repeat center center fixed');
        $('body').css('background-size', 'cover');
    }else if($('#itinerary').is(':visible')){
        $('body').css('background', 'url(./images/cityLiving.jpg) no-repeat center center fixed');
        $('body').css('background-size', 'cover');
    }else{
        $('body').css('background', 'url(./images/sunriseCity.jpg) no-repeat center center fixed');
        $('body').css('background-size', 'cover');
    }
}

/**
 ******************** Creates the google map **********************
 **/

function initMap() {
    var locations = [];
    var markers = [];
    var map;
    activityLocations.forEach(function(item){
        locations.push({title: item.name, location: {lat:item.lat, lng: item.lng}});
    });
    foodLocations.forEach(function(item){
        locations.push({title: item.name, location: {lat:item.lat, lng: item.lng}});
    });
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.052235, lng: -118.243683},
        zoom: 13,
        styles: styles
    });
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
    var listener = google.maps.event.addListener(map, "idle", function(){
        google.maps.event.trigger(map,'resize');
        map.fitBounds(bounds);
        google.maps.event.removeListener(listener);
    });
}

/**
 ****************** Creates info information for the google map markers ********************
 **/

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
 ******************** Style for the google map **********************
 **/
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

/**
 ****************** Google auto-complete feature for city input ********************
 **/

function autoComplete(){
    var input = document.getElementById('city-input');
    var options = {
        types: ['(cities)'],
        componentRestrictions: {country: 'us'}
    };
    new google.maps.places.Autocomplete(input, options);
}

/**
 **************** Clears the activities and food grid of previous information *******
 **/

function clearInfo(){
    for(var i = 0; i < 20; i++){
        $(".activity" + i).text("");
        $(".food" + i).text("");
    }
}

$(document).ready(function(){
    $("#navigation").hide();
    $("#activities").hide();
    $("#foodPlaces").hide();
    $("#itinerary").hide();
    $("#submit-btn").click(makeApiCalls);
    $(".thePlans").click(togglePlans);
    $(".changeCity").click(changeCity);
    $(".changeActivities").click(changeActivities);
    $(".changeFood").click(changeFood);
    $(".nextPage").click(nextPage);
    $(".previousPage").click(previousPage);
    autoComplete();
});