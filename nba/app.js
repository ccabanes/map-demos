
var mapOptions={
    map : null,
    layers:{
        court: null,
        shots: null
    },
    shots : {
        location: {
            x: null,
            y : null
        }, 
        options :{          
        }, 
        shotsData:{
            fulldata: null,
            criteria: null
        },
        criteria: null, 
        criteriaIndex: null,
        selectedValue:null,
        criteriaOptions: [],
        maptype:null
    }, 
    // Columns to display into popup information
    displayInfo:{
        "GRID_TYPE":false,
        "GAME_ID":false,
        "GAME_EVENT_ID":false,
        "PLAYER_ID":false,
        "PLAYER_NAME":false,
        "TEAM_ID":false,
        "TEAM_NAME":true,
        "PERIOD":true,
        "MINUTES_REMAINING":true,
        "SECONDS_REMAINING":true,
        "EVENT_TYPE":true,
        "ACTION_TYPE":false,
        "SHOT_TYPE":true,
        "SHOT_ZONE_BASIC":true,
        "SHOT_ZONE_AREA":true,
        "SHOT_ZONE_RANGE":true,
        "SHOT_DISTANCE":true,
        "LOC_X":true,
        "LOC_Y":true,
        "SHOT_ATTEMPTED_FLAG":false,
        "SHOT_MADE_FLAG":false
    },
    response:  null
};


function manageNBAresponse(){    
    
    var shots = mapOptions.shots.resultSets[0];
    mapOptions.shots.headerShots = shots.headers;
    mapOptions.shots.shotsData.fulldata = shots.rowSet;
    mapOptions.shots.location.x = null;
    mapOptions.shots.location.y = null;

    //Get request criterias
    var jQueryObject =  jQuery( "#selector" );

    if(mapOptions.shots.criteria != "ALL"){        
        var location =_.indexOf(mapOptions.shots.headerShots, mapOptions.shots.criteria);
        mapOptions.shots.criteriaIndex = location;
        var newMapValues = _.map(mapOptions.shots.shotsData.fulldata, location);
        var uniqueValues = _.uniq(newMapValues);

        //Load into new selector        
        var html = '<div><h4>Select criteria:</h4><select id ="shotCriteria" class="form-control"></select></div>';    
        createSelector(jQueryObject,html,"shotCriteria" );
        
        var jQueryCriteriaObject = jQuery("#shotCriteria");
        loadCriteria(uniqueValues,jQueryCriteriaObject,"");      
            
    }else{       
       createSelector(jQueryObject,"","shotCriteria" );
       mapOptions.shots.shotsData.criteria = mapOptions.shots.shotsData.fulldata;
       printShots();
    }
        
     jQuery("#shotCriteria").trigger("change");
}

function loadCriteria(map, object,defaultSelection){
    mapOptions.shots.criteriaOptions =[];    

  _.forEach(_.sortBy(map), function(value, key) {
        mapOptions.shots.criteriaOptions.push(value);
         if(value == defaultSelection || object.find("option").length == 0 ){
            object.append('<option value="'+key+'" selected="selected">'+value+'</option>');
            mapOptions.map.selectedValue = value;
         }else{
            object.append('<option value="'+key+'">'+value+'</option>');
         }          
     });        
}

function buildSelectOption(response, defaultSelection, selector){
    var jsonP = jQuery.parseJSON(response);
    mapOptions.response= jsonP;
    mapOptions.shots.options = mapOptions.response;
    mapOptions.shots.resultSets = mapOptions.response.resultSets;

    //Load criterias	
    var jqObject = jQuery("#"+selector).find("optgroup");
    loadCriteria(mapOptions.shots.resultSets[0].headers,jqObject,defaultSelection);          

    //Declare listener
    jQuery("#"+selector).on("change", selectorChange);
    jQuery("#"+selector).trigger("change");
}

function selectorChange(){
    var selectedOption =  jQuery("#shotTypeSelector").find(":selected").text();
    mapOptions.shots.criteria=selectedOption;
    manageNBAresponse();
}

function createSelector(jQueryObject, html, id){
    jQuery("#"+id).parent().remove();    
    jQueryObject.append(html);
    jQuery("#"+id).on("change", function(){        
        var selected = _.findIndex(mapOptions.shots.criteriaOptions, jQuery("#"+id).find("option:selected").text());
        var index = _.findIndex(mapOptions.shots.criteriaOptions, function(o) {
            var selectedOption  = jQuery("#shotCriteria").find("option:selected").text()
            if(o == selectedOption ){
                return true;
            }              
        });
        var candidates = _.filter(mapOptions.shots.shotsData.fulldata, [mapOptions.shots.criteriaIndex, mapOptions.shots.criteriaOptions[index]]);
        mapOptions.shots.shotsData.criteria = candidates;        
        printShots();
     });

}


function printShots(){

   cleanLayers();
     
    _.forEach(mapOptions.shots.shotsData.criteria, function(value, key) {
        if(mapOptions.shots.location.x == null || mapOptions.shots.location.y == null){
            var x =_.indexOf(mapOptions.shots.headerShots, "LOC_X");
            var y =_.indexOf(mapOptions.shots.headerShots, "LOC_Y");
            if(x >=0 && y >= 0){
                mapOptions.shots.location.x = x;
                mapOptions.shots.location.y = y;    
            }else{
                return;
            }
        }
            locateShotOnMap(value);          
        });   
}

function cleanLayers(){
    //Clean layer values from last criteria selection
    if(mapOptions.map.hasLayer(mapOptions.layers.shots)){
        mapOptions.map.removeLayer(mapOptions.layers.shots);
    }
    
    var layer = L.featureGroup();
    mapOptions.layers.shots = layer;    
    mapOptions.map.addLayer(layer);
}


function locateShotOnMap(shot){

    var xy = L.latLng(shot[mapOptions.shots.location.y], shot[mapOptions.shots.location.x]);
    var shotLocation = L.circleMarker(xy, style(shot));
    shotLocation.properties = shot;
    shotLocation.setRadius(5);
     shotLocation.on({        
        click: displayPopup
    });
    mapOptions.layers.shots.addLayer(shotLocation);

    function style(shot) {
     return {
            fillColor: getColor(shot),
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    function getColor(shot){
        if(shot[_.indexOf(mapOptions.shots.headerShots, "SHOT_MADE_FLAG")] > 0){
            return "#04B404";
        }else{
            return "#DF0101";
        }
        
    }

    function displayPopup(e){       
        var prop = e.target.properties;
        var text = buildPopupText(prop);
        var popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(text)
        .openOn(mapOptions.map);
        
        function buildPopupText(shotProps){ 
            var htmlPopup = "<b>Stephen Curry shots. </b><em>(Regular seasson)</em><br>";
            _(shotProps).forEach(function(value, key) {
                var display =mapOptions.displayInfo[mapOptions.shots.headerShots[key]];
                if(display){
                 htmlPopup = htmlPopup.concat("<b>" + mapOptions.shots.headerShots[key] + ":</b> " + value +"</br>");
                }              
            })
            return htmlPopup;
            ;
        }
    }
}

function drawCourt(){
    var courtLayer = L.featureGroup();
    var courtStyle = {
            fill: true,                        
            opacity: 1,
            color: 'white',                        
    };
    var courDashtStyle = {
            weight: 1.5,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 1
    };

    var courtBounds = [[-55, -250], [885, 250]]    
    var court = 'nba_court.svg';    
    var court_base = 'nba_court_white.png';    

    //Set into the mapOptions object         
    L.imageOverlay(court_base, courtBounds).addTo(map);
    L.imageOverlay(court, courtBounds).addTo(map);
}
