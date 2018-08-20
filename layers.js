const DOFMAPLAYERS = [
		new ol.layer.Tile({
			title: "OSM",
			name: "Open Street Map",
			source: new ol.source.OSM(),
			baselayer: true,
			visible: false
		}),
		new ol.layer.Tile({
			name: "D&aelig;mpet sk&aelig;rmkort",
			source: new ol.source.TileWMS({
			attributions: [new ol.Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Skærmkort</a>'})],
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
	    	new ol.layer.Tile({
	    		name:'Luftfoto',
	    		source: new ol.source.TileWMS({
		    		urls:["//a.kortforsyningen.kms.dk/orto_foraar","//b.kortforsyningen.kms.dk/orto_foraar","//c.kortforsyningen.kms.dk/orto_foraar","//d.kortforsyningen.kms.dk/orto_foraar"],
		    		attributions: [new ol.Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Ortofoto 2016</a>'})],
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
                new ol.layer.Tile({
                        name:'Topografisk kort',
                        source: new ol.source.TileWMS({
                                urls:["//a.kortforsyningen.kms.dk/topo25","//b.kortforsyningen.kms.dk/topo25","//c.kortforsyningen.kms.dk/topo25","//d.kortforsyningen.kms.dk/topo25"],
                                attributions: [new ol.Attribution({html:'<a href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Indeholder data fra Styrelsen for Dataforsyning og Effektivisering, Topo 25</a>'})],
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
				if(layers[m].getSource() instanceof ol.source.TileWMS){
					b.getSource().updateParams({ticket : ticket});
				}
			}
};

var getNewTicket = function() {


    return ticket
};
