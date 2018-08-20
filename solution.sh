#!/bin/bash


rm ./dist/*

tar -cf solution.tar ./node_modules/bootstrap ./node_modules/font-awesome ./node_modules/jquery ./node_modules/jquery-ui-dist ./node_modules/openlayers ./node_modules/moment ./layers.js ./LayerSwitcher.js ./gpsmap.js ./dofmap.css

mv ./solution.tar ./dist
cp ./config/dist.js ./dist/config.js
cp ./index.html ./dist/oernemap.html


