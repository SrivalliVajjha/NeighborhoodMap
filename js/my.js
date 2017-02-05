$("#menu-toggle")
    .click(function(e) {
        //e.preventDefault();
        $("#wrapper")
            .toggleClass("toggled");
    });
var markers = [];
var locations = [
    {
        title: 'Charminar',
        location: {
            lat: 17.3616,
            lng: 78.4747
        }
    },
    {
        title: 'Golkonda',
        location: {
            lat: 17.3833,
            lng: 78.4011
        }
    },
    {
        title: 'Salarjung Museum',
        location: {
            lat: 17.3713,
            lng: 78.4804
        }
    },
    {
        title: 'Makkah Masjid, Hyderabad',
        location: {
            lat: 17.3604,
            lng: 78.4736
        }
    },
    {
        title: 'Buddha Statue of Hyderabad',
        location: {
            lat: 17.4156,
            lng: 78.4750
        }
    }
    ];
var styles =
    [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#167f9c"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
];
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 17.3850,
            lng: 78.4867
        },
        zoom: 12,
        styles: styles,
        mapTypeControl :false
    });
    ko.applyBindings(new ViewModel());
}
//viewModel
var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray(locations);
    self.title = ko.observable('');
    self.currentMarker = function(place) {
        console.log(place.title);
         toggleBounce(place.marker);
        // trigger the click event of the marker
        new google.maps.event.trigger(place.marker, 'click');
    };
    self.OnClickPlace = ko.observable('');
    self.search = ko.computed(function() {
        var userInput = self.OnClickPlace()
            .toLowerCase(); // Make search case insensitive
        return searchResult = ko.utils.arrayFilter(self.locationList(), function(item) {
            var title = item.title.toLowerCase(); // Make search case insensitive
            var userInputIsInTitle = title.indexOf(userInput) >= 0; // true or false
            if (item.marker) {
                item.marker.setVisible(userInputIsInTitle); // toggle visibility of the marker
            }
            return userInputIsInTitle;
        });
    })
    var largeInfowindow = new google.maps.InfoWindow(); //creating the Infowindow
    var bounds = new google.maps.LatLngBounds(); //bounds of the map        
    var defaultIcn= makeMarkerIcon('0091ff');
     var HighlightedIcn= makeMarkerIcon('ffff24');
    
    for (var i = 0; i < locations.length; i++) //creating marker and infowindow for each and every location in the locations list
    {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcn,
            map: map,
            id: i
        });
        locations[i].marker = marker; //linking with the click using the locations array
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', function() { //adding click listener to the marker
           toggleBounce(this,marker);
            populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(HighlightedIcn);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcn);
          });
    }
    //map.fitBounds(bounds);
     
};
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        //infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.close(map,marker);
            
        });

        //street view on the marker
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
    
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                //infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panaromaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panaroma = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panaromaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No streetview Found</div>');
            }
        }
         var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
            url: wikiURL,
            dataType: "jsonp"
            }).done(function(response) {
                var articleStr = response[1];
                var URL = 'http://en.wikipedia.org/wiki/' + marker.title;
                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                infowindow.setContent('<div>' + marker.title + '</div><br><a href ="' + URL + '">' + URL + '</a><hr><div id="pano"></div>');
                // Open the infowindow on the correct marker.
                infowindow.open(map, marker);
                console.log(URL);
                // error handling for jsonp requests with fail method.
            }).fail(function (jqXHR, textStatus) {
                    alert("failed to load wikipedia resources");
                    });
    }
};
function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(google.maps.Animation.null);
    }, 1400);
};

function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      };
function mapError(){
     alert('Oopz!.failed to load google map.Try again later');
};