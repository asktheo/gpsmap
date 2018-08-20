# Gpsmap

## Introduction
Imagine you sample gps data daily from a number of units and you want to visualize them on a map. In the demo the map zooms to the extent of the gps data - displayed as normal WMS layers on top of a base map. But the data is also fetched and ready for an animation which the user can activate by pressing the play button.

# Components / fremworks used
Page built with jQuery. The files gpsmap.js and config.js are for displaying a map with gps coordinates.

## OpenLayers
Map component in OpenLayers 3+, for displaying and animating data from a gps.

## Spring boot
Java Micro-webservice for logging in to Kortforsyningen and getting back a Token for the base maps

## Geoserver
WMS - image data - and WFS layer - json data - from GeoServer 2.12

## Bootstrap 
v. 3.3 for layout and making the page responsive

## Font-Awesome
for some buttons

## Sunrise-sunset
Library  "Sunrise-sunset", https://sunrise-sunset.org/

# Purpose
Originally made for DOF - Birdlife Denmark displaying data from 2 white-tailed sea-eagles.

# Dependencies
Made with Node.js, JQuery, OpenLayers4, Twitter Bootstrap and Font-awesome. See the dependencies in the package.json file.

# Demo
See https://theori.pro/gpsmap
