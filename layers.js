import Tile from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import OSM from 'ol/source/OSM.js';
import Attribution from 'ol/source/Source.js';

const DOFMAPLAYERS = [
		new Tile({
			title: "OSM",
			name: "Open Street Map",
			source: new OSM(),
			baselayer: true,
			visible: false
		}),
		new Tile({
			name: "D&aelig;mpet sk&aelig;rmkort",
			source: new TileWMS({
			attributions: [new Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Skærmkort</a>'})],
			urls: ["//a.kortforsyningen.kms.dk/topo_skaermkort", "//b.kortforsyningen.kms.dk/topo_skaermkort", "//c.kortforsyningen.kms.dk/topo_skaermkort", "//d.kortforsyningen.kms.dk/topo_skaermkort"], 
			format: 'image/jpeg',
			params:{
				ticket: null,
				LAYERS:"dtk_skaermkort_daempet",
				STYLES:"default",
				TRANSPARENT: "TRUE"
				}        	
			}),
			baselayer: true,
			visible: false			
		}),
	    	new Tile({
	    		name:'Luftfoto',
	    		source: new TileWMS({
		    		urls:["//a.kortforsyningen.kms.dk/orto_foraar","//b.kortforsyningen.kms.dk/orto_foraar","//c.kortforsyningen.kms.dk/orto_foraar","//d.kortforsyningen.kms.dk/orto_foraar"],
		    		attributions: [new Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Ortofoto 2016</a>'})],
			        format: 'image/jpeg',
			        params:{
					    ticket: null,
			        	LAYERS:'orto_foraar',
			        	STYLES:"default",
			        	TRANSPARENT: "TRUE"
		        	}
			}),
			baselayer: true,
			visible: true	
	    	}),
                new Tile({
                        name:'Topografisk kort',
                        source: new TileWMS({
                                urls:["//a.kortforsyningen.kms.dk/topo25","//b.kortforsyningen.kms.dk/topo25","//c.kortforsyningen.kms.dk/topo25","//d.kortforsyningen.kms.dk/topo25"],
                                attributions: [new Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Topo 25</a>'})],
                                format: 'image/jpeg',
                                params:{
                                        ticket:null,
                                        LAYERS:'topo25_klassisk',
                                        STYLES:"default",
                                        TRANSPARENT: "TRUE"
                                }
                        }),
                        baselayer: true,
                        visible: false
                })
];

var applyTicket = function(layers,ticket) {
			for (var m = 0; m < layers.length; m++) {
				var b = layers[m];
				if(layers[m].getSource() instanceof TileWMS){
					b.getSource().updateParams({ticket : ticket});
				}
			}
};

export {DOFMAPLAYERS, applyTicket}
