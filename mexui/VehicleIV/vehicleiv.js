var VehicleIV = {};

/*
Developed by SirCryptic
Credits to all respectfull authors in the gta modding scene without them this would not be possible

special thanks to Donovan Becker for helping me test

*/
// Global variables
var godModeEnabled = false;
var copsDisabled = false;
var lastSpawnedVehicle = null;
var isSpawning = false;

// Function to display on-screen message
function showMessage(text) {
    try {
        natives.printStringWithLiteralStringNow('STRING', text, 3000, true); // Display for 3 seconds
    } catch (e) {
        console.error('showMessage error: ' + e.message); // Log to console if native fails
    }
}

// Function to calculate position in front of player
function getPosInFrontOfPos(pos, heading, distance) {
    try {
        var x = pos.x + distance * Math.cos(heading);
        var y = pos.y + distance * Math.sin(heading);
        var z = pos.z;
        var newPos = new Vec3(x, y, z);
        return newPos;
    } catch (e) {
        showMessage('Failed to calculate spawn position');
        return null;
    }
}

// Function to create vehicle with model validation/loading
function createVehicle2(hash, position, sync) {
    try {
        if (natives.isModelInCdimage(hash)) {
            natives.requestModel(hash);
            natives.loadAllObjectsNow();
            return natives.createCar(hash, position, sync);
        } else {
            showMessage('Model ' + hash + ' is not in CD image!');
            return null;
        }
    } catch (e) {
        showMessage('Failed to spawn vehicle: ' + e.message);
        return null;
    }
}

VehicleIV.init = function() {
    // Check if mexui is available
    if (typeof mexui === 'undefined' || !mexui) {
        console.error('mexui is not available. Ensure the mexui resource is loaded on the server.');
        showMessage('Error: mexui resource failed to load!');
        return;
    }

    // Define styles
    var styles = {
        main: {
            hover: {
                backgroundColour: toColour(0, 0, 200, 200), // Blue hover
                transitionTime: 500
            }
        }
    };

    // Create window with height 350px
    var window = mexui.window(500, 200, 400, 350, 'Vehicle Spawner', styles);
    window.setShown(false);
    window.center();

    // GTA IV vehicle models
    var vehicleModels = [
        { name: 'Admiral', display: 'Admiral', id: 1264341792 },
        { name: 'Airtug', display: 'Airtug', id: 1560980623 },
        { name: 'Ambulance', display: 'Ambulance', id: 1171614426 },
        { name: 'Banshee', display: 'Banshee', id: -1041692462 },
        { name: 'Benson', display: 'Benson', id: 2053223216 },
        { name: 'Biff', display: 'Biff', id: 850991848 },
        { name: 'Blista', display: 'Blista', id: -344943009 },
        { name: 'Bobcat', display: 'Bobcat', id: 1075851868 },
        { name: 'Boxville', display: 'Boxville', id: -1987130134 },
        { name: 'Buccaneer', display: 'Buccaneer', id: -682211828 },
        { name: 'Burrito', display: 'Burrito', id: -1346687836 },
        { name: 'Burrito2', display: 'Burrito 2', id: -907477130 },
        { name: 'Bus', display: 'Bus', id: -713569950 },
        { name: 'Cabby', display: 'Cabby', id: 1884962369 },
        { name: 'Cavalcade', display: 'Cavalcade', id: 2006918058 },
        { name: 'Chavos', display: 'Chavos', id: -67282078 },
        { name: 'Cognoscenti', display: 'Cognoscenti', id: -2030171296 },
        { name: 'Comet', display: 'Comet', id: 1063483177 },
        { name: 'Coquette', display: 'Coquette', id: 108773431 },
        { name: 'DF8', display: 'DF8', id: 162883121 },
        { name: 'Dilettante', display: 'Dilettante', id: -1130810103 },
        { name: 'Dukes', display: 'Dukes', id: 723973206 },
        { name: 'E109', display: 'E109', id: -1971955454 },
        { name: 'Emperor', display: 'Emperor', id: -685276541 },
        { name: 'Emperor2', display: 'Rusty Emperor', id: -1883002148 },
        { name: 'Esperanto', display: 'Esperanto', id: -276900515 },
        { name: 'Faction', display: 'Faction', id: -2119578145 },
        { name: 'FIB', display: 'FIB Car', id: 1127131465 },
        { name: 'Feltzer', display: 'Feltzer', id: -1097828879 },
        { name: 'Feroci', display: 'Feroci', id: 974744810 },
        { name: 'Feroci2', display: 'Airport Feroci', id: 1026055242 },
        { name: 'Firetruck', display: 'Firetruck', id: 1938952078 },
        { name: 'Flatbed', display: 'Flatbed', id: 1353720154 },
        { name: 'Fortune', display: 'Fortune', id: 627033353 },
        { name: 'Forklift', display: 'Forklift', id: 1491375716 },
        { name: 'Futo', display: 'Futo', id: 2016857647 },
        { name: 'FXT', display: 'FXT', id: 675415136 },
        { name: 'Habanero', display: 'Habanero', id: 884422927 },
        { name: 'Hakumai', display: 'Hakumai', id: -341892653 },
        { name: 'Huntley', display: 'Huntley', id: 486987393 },
        { name: 'Infernus', display: 'Infernus', id: 418536135 },
        { name: 'Ingot', display: 'Ingot', id: -1289722222 },
        { name: 'Intruder', display: 'Intruder', id: 886934177 },
        { name: 'Landstalker', display: 'Landstalker', id: 1269098716 },
        { name: 'Lokus', display: 'Lokus', id: -37030056 },
        { name: 'Manana', display: 'Manana', id: -2124201592 },
        { name: 'Marbella', display: 'Marbella', id: 1304597482 },
        { name: 'Merit', display: 'Merit', id: -1260881538 },
        { name: 'Minivan', display: 'Minivan', id: -310465116 },
        { name: 'Moonbeam', display: 'Moonbeam', id: 525509695 },
        { name: 'MrTasty', display: 'Mr. Tasty', id: 583100975 },
        { name: 'Mule', display: 'Mule', id: 904750859 },
        { name: 'NooseCruiser', display: 'Noose Patrol Car', id: 148777611 },
        { name: 'NooseStockade', display: 'Noose Stockade', id: 1911513875 },
        { name: 'Oracle', display: 'Oracle', id: 1348744438 },
        { name: 'Packer', display: 'Packer', id: 569305213 },
        { name: 'Patriot', display: 'Patriot', id: -808457413 },
        { name: 'Perennial', display: 'Perennial', id: -2077743597 },
        { name: 'Perennial2', display: 'Airport Perennial', id: -1590284256 },
        { name: 'Peyote', display: 'Peyote', id: 1830407356 },
        { name: 'Phantom', display: 'Phantom', id: -2137348917 },
        { name: 'Pinnacle', display: 'Pinnacle', id: 131140572 },
        { name: 'PMP600', display: 'PMP-600', id: 1376298265 },
        { name: 'Police', display: 'Police Cruiser', id: 2046537925 },
        { name: 'Police2', display: 'Police Patrol', id: -1627000575 },
        { name: 'Police3', display: 'Police Patriot', id: -350085182 },
        { name: 'Pony', display: 'Pony', id: -119658072 },
        { name: 'Premier', display: 'Premier', id: -1883869285 },
        { name: 'Presidente', display: 'Presidente', id: -1962071130 },
        { name: 'Primo', display: 'Primo', id: -1150599089 },
        { name: 'Stockade', display: 'Police Stockade', id: -1900572838 },
        { name: 'Rancher', display: 'Rancher', id: 1390084576 },
        { name: 'Rebla', display: 'Rebla', id: 83136452 },
        { name: 'Reply', display: 'Reply', id: -845979911 },
        { name: 'Romero', display: 'Romero', id: 627094268 },
        { name: 'RomanTaxi', display: 'Roman\'s Taxi', id: -1932515764 },
        { name: 'Ruiner', display: 'Ruiner', id: -227741703 },
        { name: 'Sabre', display: 'Sabre', id: -449022887 },
        { name: 'Sabre2', display: 'Sabre 2', id: 1264386590 },
        { name: 'SabreGT', display: 'Sabre GT', id: -1685021548 },
        { name: 'Schafter', display: 'Schafter', id: -322343873 },
        { name: 'Sentinel', display: 'Sentinel', id: 1349725314 },
        { name: 'Solair', display: 'Solair', id: 1344573448 },
        { name: 'Speedo', display: 'Speedo', id: -810318068 },
        { name: 'Stallion', display: 'Stallion', id: 1923400478 },
        { name: 'Steed', display: 'Steed', id: 1677715180 },
        { name: 'Stockade2', display: 'Stockade', id: 1747439474 },
        { name: 'Stratum', display: 'Stratum', id: 1723137093 },
        { name: 'Stretch', display: 'Stretch', id: -1961627517 },
        { name: 'Sultan', display: 'Sultan', id: 970598228 },
        { name: 'SultanRS', display: 'Sultan RS', id: -295689028 },
        { name: 'SuperGT', display: 'Super GT', id: 1821991593 },
        { name: 'Taxi', display: 'Taxi', id: -956048545 },
        { name: 'Taxi2', display: 'Taxi 2', id: 1208856469 },
        { name: 'Trashmaster', display: 'Trashmaster', id: 1917016601 },
        { name: 'Turismo', display: 'Turismo', id: -1896659641 },
        { name: 'Uranus', display: 'Uranus', id: 1534326199 },
        { name: 'Vigero', display: 'Vigero', id: -825837129 },
        { name: 'Vigero2', display: 'Vigero 2', id: -1758379524 },
        { name: 'Vincent', display: 'Vincent', id: -583281407 },
        { name: 'Virgo', display: 'Virgo', id: -498054846 },
        { name: 'Voodoo', display: 'Voodoo', id: 2006667053 },
        { name: 'Washington', display: 'Washington', id: 1777363799 },
        { name: 'Willard', display: 'Willard', id: 1937616578 },
        { name: 'Yankee', display: 'Yankee', id: -1099960214 },
        { name: 'Bobber', display: 'Bobber', id: -1830458836 },
        { name: 'Faggio', display: 'Faggio', id: -1842748181 },
        { name: 'Hellfury', display: 'Hellfury', id: 584879743 },
        { name: 'NRG900', display: 'NRG-900', id: 1203311498 },
        { name: 'PCJ600', display: 'PCJ-600', id: -909201658 },
        { name: 'Sanchez', display: 'Sanchez', id: 788045382 },
        { name: 'Zombie', display: 'Zombie', id: -570033273 },
        { name: 'Annihilator', display: 'Annihilator', id: 837858166 },
        { name: 'Maverick', display: 'Maverick', id: -1660661558 },
        { name: 'PoliceMaverick', display: 'Police Maverick', id: 353883353 },
        { name: 'TourMaverick', display: 'Tour Maverick', id: 2027357303 },
        { name: 'Dinghy', display: 'Dinghy', id: 1033245328 },
        { name: 'Jetmax', display: 'Jetmax', id: 861409633 },
        { name: 'Marquis', display: 'Marquis', id: -1043459709 },
        { name: 'Predator', display: 'Predator', id: -488123221 },
        { name: 'Reefer', display: 'Reefer', id: 1759673526 },
        { name: 'Squalo', display: 'Squalo', id: 400514754 },
        { name: 'Tuga', display: 'Tuga', id: 1064455782 },
        { name: 'Tropic', display: 'Tropic', id: 290013743 },
        { name: 'Cablecar', display: 'Cablecar', id: -960289747 },
        { name: 'Subway', display: 'Subway', id: 800869680 },
        { name: 'ElTrain', display: 'El Train', id: -1953988645 }
    ];

    // Spawn vehicle dropdown
    var vehicleDropdown = window.dropDown(10, 30, 380, 25, 'Select Vehicle', {}, function() {
        if (isSpawning) {
            showMessage('Please wait, spawning in progress...');
            return;
        }

        var selectedIndex = this.selectedEntryIndex;
        var model = vehicleModels[selectedIndex];
        var playerPos = localPlayer.position;
        var playerHeading = localPlayer.heading;

        // Validate player position and heading
        if (!playerPos || isNaN(playerPos.x) || isNaN(playerPos.y) || isNaN(playerPos.z) || isNaN(playerHeading)) {
            showMessage('Failed to spawn: Invalid player position or heading');
            return;
        }

        // Calculate spawn position 10 units in front of player
        var spawnPos = getPosInFrontOfPos(playerPos, playerHeading, 10.0);
        if (!spawnPos) {
            return; // Error message already shown in getPosInFrontOfPos
        }

        try {
            // Delete previous vehicle
            if (lastSpawnedVehicle) {
                try {
                    destroyElement(lastSpawnedVehicle);
                } catch (e) {
                    showMessage('Error deleting previous vehicle: ' + e.message);
                }
                lastSpawnedVehicle = null;
            }

            // Prevent concurrent spawns
            isSpawning = true;

            // Delay spawn to avoid rapid calls
            setTimeout(function() {
                try {
                    // Client-side spawning with createVehicle2
                    var vehicle = createVehicle2(model.id, spawnPos, true);
                    if (vehicle) {
                        natives.setCarHeading(vehicle, playerHeading);
                        // Check if the vehicle is drivable before warping
                        if (natives.isThisModelACar(model.id) || natives.isThisModelABike(model.id) || natives.isThisModelAHeli(model.id) || natives.isThisModelABoat(model.id)) {
                            natives.warpCharIntoCar(localPlayer, vehicle);
                            showMessage('Spawned: ' + model.display + ' and warped player');
                        } else {
                            showMessage('Spawned: ' + model.display + ' (non-drivable vehicle)');
                        }
                        if (godModeEnabled) {
                            natives.setCarCanBeDamaged(vehicle, false);
                        }
                        lastSpawnedVehicle = vehicle;
                    } else {
                        showMessage('Failed to spawn: ' + model.display);
                    }
                } catch (e) {
                    showMessage('Failed to spawn ' + model.display + ': ' + e.message);
                } finally {
                    isSpawning = false;
                }
            }, 500); // 500ms delay
        } catch (e) {
            showMessage('Failed to spawn ' + model.display + ': ' + e.message);
            isSpawning = false;
        }
    });
    for (var i in vehicleModels) {
        vehicleDropdown.item(vehicleModels[i].display);
    }

    // Repair button
    var repairButton = window.button(10, 60, 120, 25, 'Repair', {}, function() {
        if (localPlayer.vehicle) {
            try {
                natives.fixCar(localPlayer.vehicle);
                showMessage('Vehicle repaired');
            } catch (e) {
                showMessage('Repair error: ' + e.message);
            }
        } else {
            showMessage('Enter a vehicle to repair');
        }
    });

    // Delete button
    var deleteButton = window.button(250, 60, 120, 25, 'Delete', {}, function() {
        if (localPlayer.vehicle) {
            try {
                destroyElement(localPlayer.vehicle);
                if (localPlayer.vehicle === lastSpawnedVehicle) {
                    lastSpawnedVehicle = null;
                }
                showMessage('Vehicle deleted');
            } catch (e) {
                showMessage('Delete error: ' + e.message);
            }
        } else {
            showMessage('Enter a vehicle to delete');
        }
    });

    // Dirt level dropdown
    var dirtLevelDropdown = window.dropDown(10, 90, 185, 25, 'Dirt Level', {}, function() {
        var selectedIndex = this.selectedEntryIndex;
        if (localPlayer.vehicle) {
            try {
                natives.setVehicleDirtLevel(localPlayer.vehicle, selectedIndex);
                showMessage('Dirt level set to ' + selectedIndex);
            } catch (e) {
                showMessage('Dirt level error: ' + e.message);
            }
        } else {
            showMessage('Enter a vehicle for dirt level');
        }
    });
    for (var i = 0; i <= 10; i++) {
        dirtLevelDropdown.item('Level ' + i);
    }

    // Livery dropdown
    var liveryDropdown = window.dropDown(205, 90, 185, 25, 'Livery', {}, function() {
        var selectedIndex = this.selectedEntryIndex;
        if (localPlayer.vehicle) {
            try {
                natives.setCarLivery(localPlayer.vehicle, selectedIndex);
                showMessage('Livery set to ' + selectedIndex);
            } catch (e) {
                showMessage('Livery error: ' + e.message);
            }
        } else {
            showMessage('Enter a vehicle for livery');
        }
    });
    for (var i = 0; i <= 10; i++) {
        liveryDropdown.item('Livery ' + i);
    }

    // Color dropdowns
    var colorTypes = [
        { name: 'Primary', property: 'colour1', x: 10, y: 120 },
        { name: 'Secondary', property: 'colour2', x: 205, y: 120 },
        { name: 'Tertiary', property: 'colour3', x: 10, y: 150 },
        { name: 'Quaternary', property: 'colour4', x: 205, y: 150 }
    ];
    for (var i in colorTypes) {
        (function(colorType) {
            var dropdown = window.dropDown(colorType.x, colorType.y, 185, 25, colorType.name + ' Color', {}, function() {
                var selectedIndex = this.selectedEntryIndex;
                if (localPlayer.vehicle) {
                    try {
                        localPlayer.vehicle[colorType.property] = selectedIndex;
                        showMessage(colorType.name + ' color set to ' + selectedIndex);
                    } catch (e) {
                        showMessage(colorType.name + ' color error: ' + e.message);
                    }
                } else {
                    showMessage('Enter a vehicle to change color');
                }
            });
            for (var j = 0; j <= 10; j++) {
                dropdown.item('Color ' + j);
            }
        })(colorTypes[i]);
    }

    // Vehicle God Mode checkbox
    var godModeCheckbox = window.checkBox(10, 180, 120, 20, 'Vehicle God Mode', {}, function() {
        godModeEnabled = this.checked;
        if (localPlayer.vehicle) {
            try {
                natives.setCarCanBeDamaged(localPlayer.vehicle, !godModeEnabled);
                showMessage('Vehicle God Mode ' + (godModeEnabled ? 'enabled' : 'disabled'));
            } catch (e) {
                showMessage('Vehicle God Mode error: ' + e.message);
            }
        }
    });

    // Disable cops checkbox
    var copsCheckbox = window.checkBox(10, 210, 120, 20, 'Disable Cops', {}, function() {
        copsDisabled = this.checked;
        try {
            natives.setMaxWantedLevel(copsDisabled ? 0 : 6);
            showMessage('Cops ' + (copsDisabled ? 'disabled' : 'enabled'));
        } catch (e) {
            showMessage('Cops toggle error: ' + e.message);
        }
    });

    // Teleport to Waypoint button
    var teleportButton = window.button(10, 240, 120, 25, 'Teleport to Waypoint', {}, function() {
        try {
            var blipId = natives.getFirstBlipInfoId(8); // 8 is waypoint blip type
            if (blipId) {
                var waypointPos = natives.getBlipCoords(blipId);
                if (waypointPos && !isNaN(waypointPos.x) && !isNaN(waypointPos.y) && !isNaN(waypointPos.z)) {
                    if (localPlayer.vehicle) {
                        localPlayer.vehicle.position = waypointPos;
                        showMessage('Teleported vehicle to waypoint at ' + waypointPos.x.toFixed(2) + ', ' + waypointPos.y.toFixed(2) + ', ' + waypointPos.z.toFixed(2));
                    } else {
                        localPlayer.position = waypointPos;
                        showMessage('Teleported player to waypoint at ' + waypointPos.x.toFixed(2) + ', ' + waypointPos.y.toFixed(2) + ', ' + waypointPos.z.toFixed(2));
                    }
                } else {
                    showMessage('Invalid waypoint coordinates');
                }
            } else {
                showMessage('No waypoint set');
            }
        } catch (e) {
            showMessage('Teleport error: ' + e.message);
        }
    });

    // Footer text
    window.text(10, 270, 380, 20, 'Developed by SirCryptic aka WizzWow :)', { align: 'center' });

    // Toggle window with F3
    bindKey(SDLK_F3, KEYSTATE_DOWN, function(e) {
        if (!localPlayer) {
            showMessage('No local player available');
            return;
        }
        
        var show = !window.isShown();
        mexui.setInput(show);
        window.setShown(show);
        if (show) {
            window.center();
        }
    });
};

VehicleIV.init();
